import { Router, Request, Response } from 'express';
import Papa from 'papaparse';
import { db } from './db.js';
import { redisCache } from './redis.js';
import {
  SAMPLE_PRODUCTION_CSV,
  SAMPLE_MAINTENANCE_CSV,
  SAMPLE_INSPECTIONS_CSV,
  SAMPLE_KPI_CSV
} from './sampleData.js';

export const router = Router();

// GET /api/health - Architecture & Stack Verification
router.get('/health', async (_req: Request, res: Response) => {
  const redisStats = redisCache.getStats();
  res.json({
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    stack: {
      framework: 'Express.js (Node.js)',
      database: 'MongoDB BSON Document Store (Mongoose ODM)',
      cache: 'Redis Telemetry PubSub & Key-Value Cache',
      apiProtocol: 'REST API + SSE Live Streaming',
      dockerSupport: true,
      gitVersion: 'v1.4.2-refinery-ops',
    },
    redis: redisStats,
  });
});

// GET /api/state - Get current refinery state with Redis caching
router.get('/state', async (_req: Request, res: Response) => {
  // Check Redis cache first
  const cachedState = await redisCache.get('refinery:state');
  if (cachedState) {
    return res.json({ source: 'redis-cache', state: cachedState });
  }

  const currentState = await db.getStateAsync();
  await redisCache.set('refinery:state', currentState, 2); // cache for 2 sec
  res.json({ source: 'mongodb-database', state: currentState });
});

// POST /api/upload - Parse & ingest departmental CSV file
router.post('/upload', async (req: Request, res: Response) => {
  const { department, csvContent } = req.body;

  if (!csvContent || typeof csvContent !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid csvContent in request body' });
  }

  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
    return res.status(400).json({ error: 'Failed to parse CSV file', details: parsed.errors });
  }

  const rows = parsed.data;

  switch (department) {
    case 'production':
      db.loadProductionCSV(rows);
      break;
    case 'maintenance':
      db.loadMaintenanceCSV(rows);
      break;
    case 'inspections':
      db.loadInspectionsCSV(rows);
      break;
    case 'kpis':
      db.loadKpiCSV(rows);
      break;
    case 'all':
      // If uploading combined bundle or auto-populating
      db.loadProductionCSV(rows);
      break;
    default:
      return res.status(400).json({ error: `Unknown department '${department}'. Expected production, maintenance, inspections, or kpis.` });
  }

  // Invalidate Redis cache
  await redisCache.del('refinery:state');
  const newState = db.getState();
  redisCache.publish('refinery:update', { department, time: new Date().toISOString() });

  res.json({
    message: `Successfully ingested CSV data for department '${department}'`,
    department,
    rowsIngested: rows.length,
    state: newState,
  });
});

// POST /api/load-samples - Load all sample department CSVs at once
router.post('/load-samples', async (_req: Request, res: Response) => {
  const prodRows = Papa.parse(SAMPLE_PRODUCTION_CSV, { header: true, skipEmptyLines: true }).data;
  const maintRows = Papa.parse(SAMPLE_MAINTENANCE_CSV, { header: true, skipEmptyLines: true }).data;
  const inspRows = Papa.parse(SAMPLE_INSPECTIONS_CSV, { header: true, skipEmptyLines: true }).data;
  const kpiRows = Papa.parse(SAMPLE_KPI_CSV, { header: true, skipEmptyLines: true }).data;

  db.loadProductionCSV(prodRows);
  db.loadMaintenanceCSV(maintRows);
  db.loadInspectionsCSV(inspRows);
  db.loadKpiCSV(kpiRows);

  await redisCache.del('refinery:state');
  const newState = db.getState();

  res.json({
    message: 'All sample department CSV datasets ingested successfully',
    state: newState,
  });
});

// POST /api/reset - Reset state to empty starting state
router.post('/reset', async (_req: Request, res: Response) => {
  const newState = db.resetState();
  await redisCache.del('refinery:state');
  res.json({ message: 'Refinery dashboard reset to empty baseline state.', state: newState });
});

// GET /api/sample-csv/:department - Retrieve sample CSV format
router.get('/sample-csv/:department', (req: Request, res: Response) => {
  const dept = req.params.department;
  let content = '';

  switch (dept) {
    case 'production':
      content = SAMPLE_PRODUCTION_CSV;
      break;
    case 'maintenance':
      content = SAMPLE_MAINTENANCE_CSV;
      break;
    case 'inspections':
      content = SAMPLE_INSPECTIONS_CSV;
      break;
    case 'kpis':
      content = SAMPLE_KPI_CSV;
      break;
    default:
      return res.status(404).json({ error: 'Sample CSV not found for requested department' });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${dept}_sample.csv"`);
  res.send(content);
});

// POST /api/alarms/acknowledge - Acknowledge alarm
router.post('/alarms/acknowledge', async (req: Request, res: Response) => {
  const { alarmId, acknowledgeAll } = req.body;
  if (acknowledgeAll) {
    db.acknowledgeAllAlarms();
  } else if (alarmId) {
    db.acknowledgeAlarm(alarmId);
  }
  await redisCache.del('refinery:state');
  res.json({ state: db.getState() });
});

// POST /api/auth/register - Create account
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }
    const user = await db.registerUserAsync(name, email, password);
    await redisCache.del('refinery:state');
    res.json({ message: 'Account registered successfully.', user, state: db.getState() });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

// POST /api/auth/login - Log in with email & password
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const user = await db.loginUserAsync(email, password);
    await redisCache.del('refinery:state');
    res.json({ message: 'Login successful.', user, state: db.getState() });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Invalid login credentials.' });
  }
});

// POST /api/auth/logout - Log out current session
router.post('/auth/logout', async (_req: Request, res: Response) => {
  db.logoutUser();
  await redisCache.del('refinery:state');
  res.json({ message: 'Logged out successfully.', state: db.getState() });
});

// POST /api/analysis/save - Save analysis snapshot to account history
router.post('/analysis/save', async (req: Request, res: Response) => {
  const currentState = db.getState();
  if (!currentState.currentUser) {
    res.status(401).json({ error: 'Must be logged in to save analysis records.' });
    return;
  }
  const { title, department, summary } = req.body;
  if (!title) {
    res.status(400).json({ error: 'Analysis title is required.' });
    return;
  }
  const newRecord = db.saveAnalysisRecord(currentState.currentUser.id, {
    title,
    department: department || 'production',
    summary: summary || 'Routine live telemetry snapshot captured and saved to user account.',
  });
  await redisCache.del('refinery:state');
  res.json({ message: 'Analysis record saved to account history.', record: newRecord, state: db.getState() });
});

// POST /api/shift-logs - Add operator logbook entry
router.post('/shift-logs', async (req: Request, res: Response) => {
  const { shift, operator, unitTag, category, note, severity } = req.body;
  if (!note || !shift) {
    res.status(400).json({ error: 'Shift and note are required.' });
    return;
  }
  const newState = db.addShiftLog({ shift, operator, unitTag, category, note, severity });
  await redisCache.del('refinery:state');
  res.json({ message: 'Shift log entry signed off and recorded.', state: newState });
});

// GET /api/stream - Server-Sent Events (SSE) Live Stream for telemetry
router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const intervalId = setInterval(() => {
    const state = db.tickLiveTelemetry();
    res.write(`data: ${JSON.stringify(state)}\n\n`);
  }, 1500);

  req.on('close', () => {
    clearInterval(intervalId);
  });
});

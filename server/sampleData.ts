export const SAMPLE_PRODUCTION_CSV = `tag,unit,state,rate,max_rate,temp,pressure
CDU-05,Atmospheric Crude Distillation,RUNNING,176461,200000,362,3.2
VDU-05,Vacuum Distillation,RUNNING,94246,110000,415,0.15
FCC-05,Fluid Catalytic Cracking,RUNNING,72189,80000,543,2.8
HCU-02,Hydrocracker Unit,RUNNING,48310,60000,380,14.5
DCU-01,Delayed Coker Unit,STANDBY,0,45000,110,1.2
SMR-03,Steam Methane Reformer,RUNNING,32000,35000,850,22.0`;

export const SAMPLE_MAINTENANCE_CSV = `id,equipment_tag,unit,description,priority,status,scheduled_date,overdue,assigned_team
WO-1042,PUMP-05A,CDU-05,Crude feed pump seal replacement,HIGH,OPEN,2026-10-02,true,Mech Team Alpha
WO-1043,VALVE-210,VDU-05,Vacuum column pressure relief valve check,CRITICAL,BLOCKED,2026-10-01,true,Instrument Techs
WO-1044,COMP-03,FCC-05,Wet gas compressor vibration diagnostic,HIGH,IN_PROGRESS,2026-10-04,false,Reliability Eng
WO-1045,EXCH-12,HCU-02,Heat exchanger tube bundle cleaning,MEDIUM,OPEN,2026-10-08,false,Turnaround Crew
WO-1046,FLARE-01,OFFSITES,Pilot ignition system preventative check,LOW,COMPLETED,2026-09-30,false,Electrical Team`;

export const SAMPLE_INSPECTIONS_CSV = `id,unit_tag,inspector,category,status,inspection_date,next_due,notes
INSP-301,CDU-05,Chief Insp M. Sterling,PRESSURE_VESSEL,PASSED,2026-09-28,2026-11-28,Wall thickness verified via NDT. Zero corrosion detected.
INSP-302,VDU-05,Insp J. Vance,CORROSION,ACTION_REQUIRED,2026-10-01,2026-10-05,Minor localized pitting observed on overhead line line 14-B.
INSP-303,FCC-05,OSHA Inspector K. Drake,OSHA_SAFETY,PASSED,2026-09-15,2026-12-15,Catwalk safety railing and safety shower pressure passed audit.
INSP-304,DCU-01,Insp R. Patel,HAZMAT,OVERDUE,2026-09-20,2026-09-25,Coke drum vapor line flange seal check overdue by 9 days.
INSP-305,OFFSITES,Fire Chief T. Miller,FIRE_SYSTEM,PASSED,2026-09-30,2026-10-30,Foam deluge monitor test successful on Tank 402.`;

export const SAMPLE_KPI_CSV = `key,category,label,value,target,unit,status,change_percent
SAFE_DAYS,SAFETY,Safe Days Without LTI,428,365,Days,OPTIMAL,+12.5
CRUDE_THROUGHPUT,YIELD,Daily Crude Processing,391206,380000,bbl/d,OPTIMAL,+3.0
ENERGY_INTENSITY,ENERGY,Solomon Energy Intensity Index,91.2,95.0,Index,OPTIMAL,-2.1
REFINERY_MARGIN,FINANCIAL,Gross Refining Margin,14.82,12.50,$/bbl,OPTIMAL,+18.5
SULFUR_RECOVERY,ENVIRONMENTAL,SRU Sulfur Recovery Rate,99.85,99.50,%,OPTIMAL,+0.35
FLARING_RATE,ENVIRONMENTAL,Sour Gas Flaring Volume,1.2,2.0,MMSCFD,OPTIMAL,-40.0`;

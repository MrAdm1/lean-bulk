import { useCallback, useEffect, useRef, useState } from 'react';
import { Nav, SheetHost, Toast, type Tab } from './components/ui';
import { todayKey } from './lib/format';
import { scheduleSync, useData } from './lib/store';
import { Prep } from './screens/Prep';
import { Progress } from './screens/Progress';
import { AddSheet, EditSheet, FoodSheet, QuickSheet, SettingsSheet, WeightSheet } from './screens/Sheets';
import { Today } from './screens/Today';
import { Train } from './screens/Train';

export type SheetState =
  | null
  | { kind: 'quick' }
  | { kind: 'weight' }
  | { kind: 'add' }
  | { kind: 'edit'; eid: string }
  | { kind: 'settings' }
  | { kind: 'food'; fid: string | null; back: SheetState };

export default function App() {
  const data = useData();
  const [tab, setTab] = useState<Tab>('today');
  const [date, setDate] = useState(todayKey());
  const [sheet, setSheet] = useState<SheetState>(null);
  const last = useRef<SheetState>(null);
  if (sheet) last.current = sheet;
  const shown = sheet || last.current;

  useEffect(() => { scheduleSync(0); }, []);
  // A new day starts on Today when the app is reopened the next morning.
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') setDate(d => (d < todayKey() && tab === 'today' ? todayKey() : d)); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [tab]);

  const close = useCallback(() => setSheet(null), []);
  const goTab = (t: Tab) => { setTab(t); window.scrollTo(0, 0); };
  const props = { data, date, close, open: setSheet, goTab };

  return (
    <>
      <main className="app">
        {tab === 'today' && <Today data={data} date={date} setDate={setDate} open={setSheet} goTab={goTab} />}
        {tab === 'train' && <Train data={data} />}
        {tab === 'prep' && <Prep data={data} />}
        {tab === 'progress' && <Progress data={data} open={setSheet} />}
      </main>
      <Nav tab={tab} setTab={goTab} onPlus={() => setSheet({ kind: 'quick' })} />
      <SheetHost open={!!sheet} onClose={close}>
        {shown?.kind === 'quick' && <QuickSheet key="quick" {...props} />}
        {shown?.kind === 'weight' && <WeightSheet key="weight" {...props} />}
        {shown?.kind === 'add' && <AddSheet key="add" {...props} />}
        {shown?.kind === 'edit' && <EditSheet key={'edit' + shown.eid} {...props} eid={shown.eid} />}
        {shown?.kind === 'settings' && <SettingsSheet key="settings" {...props} />}
        {shown?.kind === 'food' && <FoodSheet key={'food' + shown.fid} {...props} fid={shown.fid} back={shown.back} />}
      </SheetHost>
      <Toast />
    </>
  );
}

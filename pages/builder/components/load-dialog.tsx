import styles from '../../../styles/Builder.module.css'
import { forwardRef, useEffect, useState } from 'react';
import { ToggleButtonGroup, ToggleButton, CircularProgress, } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { IChart } from '../../../models/custom-charts';
import { getChartsPublic } from '../../../lib/get-charts-public';
import { getChartsPersonal } from '../../../lib/get-charts-personal';

const BuilderLoadDialog = forwardRef((props: any, ref: any) => {
  const user = props.user || {};
  const handleLoadClose = props.handleLoadClose;
  const handleLoadChart = props.handleLoadChart;

  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState<boolean>(props.isLoadDialogOpen);

  const [publicCharts, setPublicCharts] = useState<IChart[]>([]);
  const [personalCharts, setPersonalCharts] = useState<IChart[]>([]);

  const [selectedChart, setSelectedChart] = useState<IChart | null>(null);

  const [publicLoaded, setPublicLoaded] = useState<boolean>(false);
  const [personalLoaded, setPersonalLoaded] = useState<boolean>(false);

  useEffect(() => {
    async function loadPublicCharts() {
      const data = await getChartsPublic();
      setPublicCharts(data);
      setPublicLoaded(true);
    }

    async function loadPersonalCharts() {
      const data = await getChartsPersonal(user.token);
      setPersonalCharts(data);
      setPersonalLoaded(true);
    }
    
    if(isLoadDialogOpen){
      loadPublicCharts();
      if(user.token){
        loadPersonalCharts();
      }
    }
  }, [isLoadDialogOpen, user.token]);

  const updateDialogState = (state: boolean) => {
    setIsLoadDialogOpen(state);

    if(!state){
      //Wait for dialog to close before resetting state
      setTimeout(() => {
        setPublicLoaded(false);
        setPersonalLoaded(false);
        setSelectedChart(null);
      }, 400);
    }
  }

  ref.current = {
    updateDialogState
  }

  return (
    <Dialog open={isLoadDialogOpen} onClose={handleLoadClose}>
      <DialogTitle>Load custom chart</DialogTitle>
      <DialogContent sx={{height: "50vh"}}>
        <div className={styles.load_dialog_section}>
          <div className={styles.load_dialog_group}>
            <h3>Public charts</h3>
            {publicLoaded
            ? <ToggleButtonGroup
                fullWidth
                color="primary"
                size="small"
                orientation="vertical"
                aria-label="public charts list"
                exclusive
                value={selectedChart}
                onChange={(event, newChart) => {
                  setSelectedChart(newChart);
                }}
              >
                {publicCharts.map((chart, index) => (
                  <ToggleButton key={index} value={chart}>{chart.name}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            : <div className={styles.spinner_container}>
                <CircularProgress />
              </div>
            }
          </div>
          <div className={styles.load_dialog_group}>
            <h3>Personal charts</h3>
            {personalLoaded && user.token
            ? <ToggleButtonGroup
                fullWidth
                color="primary"
                size="small"
                orientation="vertical"
                aria-label="personal charts list"
                exclusive
                value={selectedChart}
                onChange={(event, newChart) => {
                  setSelectedChart(newChart);
                }}
              >
                {personalCharts.map((chart, index) => (
                  <ToggleButton key={index} value={chart}>{chart.name}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            : user.token
            ? <div className={styles.spinner_container}>
                <CircularProgress />
              </div>
            : <p>You must be logged in to view your personal charts.</p>
            }
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLoadClose}>Cancel</Button>
        <Button onClick={e => handleLoadChart(selectedChart)}>Load</Button>
      </DialogActions>
    </Dialog>
  )
})

BuilderLoadDialog.displayName = 'BuilderLoadDialog';
export default BuilderLoadDialog

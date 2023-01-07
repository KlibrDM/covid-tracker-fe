import styles from '../../../styles/Builder.module.css'
import { forwardRef, useState, useEffect } from 'react';
import { ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { getChartsPersonal, getChartsPublic } from '../../../lib/custom-chart.service';
import { IChart } from '../../../models/custom-chart';
import { MAX_RESULTS_LIMIT, RESULTS_LIMIT } from '../../../lib/constants';

const AddDialog = forwardRef((props: any, ref: any) => {
  const user = props.user || {};

  const handleDialogClose = props.handleDialogClose;
  const handleDialogAdd = props.handleDialogAdd;

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(props.isDialogOpen);

  const [publicCharts, setPublicCharts] = useState<(IChart & {_id: string})[]>([]);
  const [personalCharts, setPersonalCharts] = useState<(IChart & {_id: string})[]>([]);

  const [selectedChart, setSelectedChart] = useState<(IChart & {_id: string}) | null>(null);

  const [publicLoaded, setPublicLoaded] = useState<boolean>(false);
  const [personalLoaded, setPersonalLoaded] = useState<boolean>(false);

  const updateDialogState = (state: boolean) => {
    setIsDialogOpen(state);

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

  const loadPublicCharts = async () => {
    const data = await getChartsPublic(RESULTS_LIMIT);
    setPublicCharts(data);
    setPublicLoaded(true);
  }

  const loadPersonalCharts = async () => {
    const data = await getChartsPersonal(user.token, MAX_RESULTS_LIMIT);
    setPersonalCharts(data);
    setPersonalLoaded(true);
  }

  useEffect(() => {
    if(isDialogOpen){
      loadPublicCharts();
      if(user.token){
        loadPersonalCharts();
      }
    }
  }, [isDialogOpen, user.token]);

  return (
    <Dialog open={isDialogOpen} onClose={handleDialogClose}>
      <DialogTitle>Load custom chart</DialogTitle>
      <DialogContent sx={{height: "50vh", paddingBottom: '50px'}}>
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
                sx={{height: "100%", overflowY: "auto"}}
              >
                {publicCharts.map((chart, index) => (
                  <ToggleButton
                    key={index}
                    value={chart}
                    sx={{justifyContent: 'space-between', paddingLeft: '0.8em', textAlign: 'left'}}
                  >
                    {chart.name}
                  </ToggleButton>
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
                sx={{height: "100%", overflowY: "auto"}}
              >
                {personalCharts.map((chart, index) => (
                  <ToggleButton
                    key={index}
                    value={chart}
                    sx={{justifyContent: 'space-between', paddingLeft: '0.8em', textAlign: 'left'}}
                  >
                    {chart.name}
                  </ToggleButton>
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
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button onClick={e => selectedChart && handleDialogAdd(selectedChart)}>Load</Button>
      </DialogActions>
    </Dialog>
  )
})

AddDialog.displayName = 'AddDialog';
export default AddDialog

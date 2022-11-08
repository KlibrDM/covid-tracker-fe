import styles from '../../../styles/Builder.module.css'
import { forwardRef, useEffect, useState } from 'react';
import { ToggleButtonGroup, ToggleButton, CircularProgress, Snackbar, Alert } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteIcon from '@mui/icons-material/Delete';
import { IChart } from '../../../models/custom-charts';
import { getChartsPublic } from '../../../lib/get-charts-public';
import { getChartsPersonal } from '../../../lib/get-charts-personal';
import { deleteChart } from '../../../lib/delete-chart';

const BuilderLoadDialog = forwardRef((props: any, ref: any) => {
  const user = props.user || {};
  const handleLoadClose = props.handleLoadClose;
  const handleLoadChart = props.handleLoadChart;

  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState<boolean>(props.isLoadDialogOpen);

  const [publicCharts, setPublicCharts] = useState<(IChart & {_id: string})[]>([]);
  const [personalCharts, setPersonalCharts] = useState<(IChart & {_id: string})[]>([]);

  const [selectedChart, setSelectedChart] = useState<(IChart & {_id: string}) | null>(null);

  const [publicLoaded, setPublicLoaded] = useState<boolean>(false);
  const [personalLoaded, setPersonalLoaded] = useState<boolean>(false);

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "info" | "warning" | "error">("success");

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

  const handleChartDelete = async (chart: IChart & {_id: string}) => {
    if(chart._id){
      deleteChart(chart._id, user.token).then((data) => {
        //If sucessful, remove chart from personalCharts
        if(data.message === "Chart deleted"){
          setPersonalCharts(personalCharts.filter(c => c._id !== chart._id));
          setPublicCharts(publicCharts.filter(c => c._id !== chart._id));

          setSnackbarSeverity('warning');
          setSnackbarMessage('Chart successfully deleted');
          setSnackbarOpen(true);
        }
      });
    }
  }

  ref.current = {
    updateDialogState
  }

  return (
    <>
      <Dialog open={isLoadDialogOpen} onClose={handleLoadClose}>
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
                      <div
                        className={styles.load_dialog_delete}
                        aria-label="delete"
                        onClick={() => {
                          handleChartDelete(chart);
                        }}>
                        <DeleteIcon fontSize='inherit' />
                      </div>
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
          <Button onClick={handleLoadClose}>Cancel</Button>
          <Button onClick={e => selectedChart && handleLoadChart(selectedChart)}>Load</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
})

BuilderLoadDialog.displayName = 'BuilderLoadDialog';
export default BuilderLoadDialog

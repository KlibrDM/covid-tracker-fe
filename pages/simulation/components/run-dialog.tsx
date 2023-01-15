import { forwardRef, useState } from 'react';
import styles from '../../../styles/Simulation.module.css';
import { ILocation } from '../../../models/location';
import { Alert, CircularProgress, FormControl, InputLabel, Select, Slider, } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { SIMULATION_DATASETS } from '../../../lib/simulation-datasets';

const RunDialog = forwardRef((props: any, ref: any) => {
  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];

  const handleDialogClose = props.handleDialogClose;
  const handleDialogRun = props.handleDialogRun;

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(props.isDialogOpen);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);

  const simDatasets = Array.from(SIMULATION_DATASETS.keys());
  const [dialogLocation, setDialogLocation] = useState<string>(location);
  const [dialogDatasets, setDialogDatasets] = useState<string>(simDatasets[0]);
  const [dialogSimulationDays, setDialogSimulationDays] = useState<number>(90);


  const updateDialogState = (state: boolean) => {
    setIsDialogOpen(state);
    setIsSimulationRunning(false);
  }

  ref.current = {
    updateDialogState
  }

  return (
    <Dialog open={isDialogOpen} onClose={handleDialogClose}>
      <DialogTitle>New simulation</DialogTitle>
      {
        !isSimulationRunning ?
          <>
            <DialogContent>
              <FormControl variant="standard" fullWidth sx={{marginTop: '8px'}}>
                <InputLabel shrink={true} htmlFor="location">Location</InputLabel>
                <Select
                  native
                  labelId="location"
                  label="Location"
                  defaultValue={dialogLocation}
                  onChange={(e => {setDialogLocation(e.target.value as string)})}
                >
                  {
                    locations.map((location, index) => (
                      <option key={index} value={location.code}>{location.name}</option>
                    ))
                  }
                </Select>
              </FormControl>

              <FormControl variant="standard" fullWidth sx={{marginTop: '8px'}}>
                <InputLabel shrink={true} htmlFor="datasets">Simulation Datasets</InputLabel>
                <Select
                  native
                  labelId="datasets"
                  label="Simulation Datasets"
                  defaultValue={dialogDatasets}
                  onChange={(e => {setDialogDatasets(e.target.value as string)})}
                >
                  {
                    simDatasets.map((name, index) => (
                      <option key={index} value={name}>{name}</option>
                    ))
                  }
                </Select>
              </FormControl>

              <p style={{marginBlockEnd: '0.2em'}}>Simulation days</p>
              <Slider
                aria-label="Simulation days"
                value={dialogSimulationDays}
                onChange={(e, value) => setDialogSimulationDays(value as number)}
                valueLabelDisplay="auto"
                step={10}
                marks
                min={30}
                max={150}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={e => {
                setIsSimulationRunning(true);
                handleDialogRun({
                  dialogLocation,
                  dialogDatasets,
                  dialogSimulationDays,
                });
              }}>Run</Button>
            </DialogActions>
          </>
        :
          <DialogContent>
            <div className={styles.spinner_container} style={{padding: '4em 8em'}}>
              <CircularProgress />
              <Alert severity="info" sx={{marginTop: '1em'}}>Simulation is running...</Alert>
            </div>
          </DialogContent>
      }
    </Dialog>
  )
})

RunDialog.displayName = 'RunDialog';
export default RunDialog

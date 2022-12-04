import styles from '../../../styles/Builder.module.css'
import { forwardRef, useState } from 'react';
import { ILocation } from '../../../models/location';
import { FormControlLabel, FormGroup, Switch, FormControl, InputLabel, Select, Slider, } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { ChartType, ChartTypes, Indicators } from '../../../models/custom-chart';

const BuilderDialog = forwardRef((props: any, ref: any) => {
  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];

  const handleIndicatorClose = props.handleIndicatorClose;
  const handleIndicatorAdd = props.handleIndicatorAdd;

  const [isIndicatorDialogOpen, setIsIndicatorDialogOpen] = useState<boolean>(props.isIndicatorDialogOpen);
  const [dialogIndicator, setDialogIndicator] = useState<string>(Indicators[0].key);
  const [dialogIndicatorPerMillion, setDialogIndicatorPerMillion] = useState<boolean>(false);
  const [dialogIndicatorAverage7Days, setDialogIndicatorAverage7Days] = useState<boolean>(false);
  const [dialogIndicatorAverage14Days, setDialogIndicatorAverage14Days] = useState<boolean>(false);
  const [dialogLocation, setDialogLocation] = useState<string>(location);
  const [dialogChartType, setDialogChartType] = useState<ChartType>(ChartTypes[0]);
  const [dialogColor, setDialogColor] = useState<string>("#12b3eb");
  let auxDialogColor = "#12b3eb";
  const [dialogAreaColorAbove, setDialogAreaColorAbove] = useState<string>("#12b3eb");
  const [dialogAreaColorAboveTransparency, setDialogAreaColorAboveTransparency] = useState<number>(0.6);
  let auxDialogAreaColorAbove = "#12b3eb";
  const [dialogAreaColorBelow, setDialogAreaColorBelow] = useState<string>("#12b3eb");
  const [dialogAreaColorBelowTransparency, setDialogAreaColorBelowTransparency] = useState<number>(0.6);
  let auxDialogAreaColorBelow = "#12b3eb";

  const updateDialogState = (state: boolean) => {
    setIsIndicatorDialogOpen(state);
  }

  ref.current = {
    updateDialogState
  }

  return (
    <Dialog open={isIndicatorDialogOpen} onClose={handleIndicatorClose}>
      <DialogTitle>New indicator</DialogTitle>
      <DialogContent>
        <FormControl variant="standard" fullWidth>
          <InputLabel shrink={true} htmlFor="indicator">Indicator</InputLabel>
          <Select
            native
            labelId="indicator"
            label="Indicator"
            defaultValue={dialogIndicator}
            onChange={(e => {setDialogIndicator(e.target.value as string)})}
          >
            {
              Indicators.map((indicator, index) => (
                <option key={index} value={indicator.key}>{indicator.label}</option>
              ))
            }
          </Select>
        </FormControl>

        <FormGroup>
          <FormControlLabel control={
            <Switch checked={dialogIndicatorPerMillion} onChange={(e) => {setDialogIndicatorPerMillion(e.target.checked)}} />
          } label="Calculate per million" labelPlacement="end" />
        </FormGroup>

        <FormGroup>
          <FormControlLabel control={
            <Switch checked={dialogIndicatorAverage7Days} onChange={(e) => {
              setDialogIndicatorAverage7Days(e.target.checked);
              if(e.target.checked) { setDialogIndicatorAverage14Days(false); }
            }} />
          } label="Calculate 7 day average" labelPlacement="end" />
        </FormGroup>

        <FormGroup>
          <FormControlLabel control={
            <Switch checked={dialogIndicatorAverage14Days} onChange={(e) => {
              setDialogIndicatorAverage14Days(e.target.checked);
              if(e.target.checked) { setDialogIndicatorAverage7Days(false); }
            }} />
          } label="Calculate 14 day average" labelPlacement="end" />
        </FormGroup>

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

        <FormControl variant="standard" fullWidth sx={{marginTop: '12px'}}>
          <InputLabel shrink={true} htmlFor="chart-type">Chart Type</InputLabel>
          <Select
            native
            labelId="chart-type"
            label="Chart Type"
            defaultValue={dialogChartType}
            onChange={(e => {setDialogChartType(e.target.value as ChartType)})}
          >
            {
              ChartTypes.map((chartType, index) => (
                <option key={index} value={chartType}>{chartType.slice(0,1).toUpperCase() + chartType.slice(1)}</option>
              ))
            }
          </Select>
        </FormControl>

        <div className={styles.dialog_color_button}>
          <label htmlFor='color'>Color</label>
          <input
            type="color"
            id="color"
            name="color"
            value={dialogColor}
            onChange={(e => {auxDialogColor = e.target.value})}
            onBlur={(e => {setDialogColor(auxDialogColor)})}
          />
        </div>

        {dialogChartType === 'area' &&
          <div>
            <div className={styles.dialog_color_button}>
              <label htmlFor='colorAbove'>Area above 0</label>
              <input
                type="color"
                id="colorAbove"
                name="colorAbove"
                value={dialogAreaColorAbove}
                onChange={(e => {auxDialogAreaColorAbove = e.target.value})}
                onBlur={(e => {setDialogAreaColorAbove(auxDialogAreaColorAbove)})}
              />
            </div>
            <div className={styles.dialog_transparency_slider}>
              <p>Transparency</p>
              <Slider
                value={dialogAreaColorAboveTransparency}
                aria-label="Area color above transparency"
                valueLabelDisplay="auto"
                min={0}
                max={1}
                step={0.01}
                onChange={(e, value) => {setDialogAreaColorAboveTransparency(value as number)}}
              />
            </div>
            <div className={styles.dialog_color_button}>
              <label htmlFor='colorBelow'>Area below 0</label>
              <input
                type="color"
                id="colorBelow"
                name="colorBelow"
                value={dialogAreaColorBelow}
                onChange={(e => {auxDialogAreaColorBelow = e.target.value})}
                onBlur={(e => {setDialogAreaColorBelow(auxDialogAreaColorBelow)})}
              />
            </div>
            <div className={styles.dialog_transparency_slider}>
              <p>Transparency</p>
              <Slider
                value={dialogAreaColorBelowTransparency}
                aria-label="Area color below transparency"
                valueLabelDisplay="auto"
                min={0}
                max={1}
                step={0.01}
                onChange={(e, value) => {setDialogAreaColorBelowTransparency(value as number)}}
              />
            </div>
          </div>
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={handleIndicatorClose}>Cancel</Button>
        <Button onClick={e => handleIndicatorAdd({
          dialogIndicator,
          dialogIndicatorPerMillion,
          dialogIndicatorAverage7Days,
          dialogIndicatorAverage14Days,
          dialogLocation,
          dialogChartType,
          dialogColor,
          dialogAreaColorAbove,
          dialogAreaColorAboveTransparency,
          dialogAreaColorBelow,
          dialogAreaColorBelowTransparency
        })}>Add</Button>
      </DialogActions>
    </Dialog>
  )
})

BuilderDialog.displayName = 'BuilderDialog';
export default BuilderDialog

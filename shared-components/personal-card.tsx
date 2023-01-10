import Link from 'next/link'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useState } from 'react';

function TabPanel(props: {children?: React.ReactNode, index: number, value: number}) {
  const { children, value, index } = props;

  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

const PersonalCard = (props: any) => {
  const user = props.user || {};
  const publicArray = props.public as any[] || [];
  const personalArray = props.personal as any[] || [];
  const link = props.link || '';
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <>
      <Tabs value={tabIndex} onChange={(_e, v) => {setTabIndex(v)}}>
        <Tab label="Public"/>
        <Tab label="Personal" disabled={!user.token}/>
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <List dense>
          {
            publicArray.map((elem, i) => (
            <ListItem key={i} disablePadding>
              <Link href={(link + '?id=' + elem._id)}>
                <ListItemButton sx={{padding: 0}}>
                  <ListItemText primary={elem.name} />
                </ListItemButton>
              </Link>
            </ListItem>
            ))
          }
        </List>
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <List dense>
          {
            personalArray.map((elem, i) => (
            <ListItem key={i} disablePadding>
              <Link href={(link + '?id=' + elem._id)}>
                <ListItemButton sx={{padding: 0}}>
                  <ListItemText primary={elem.name} />
                </ListItemButton>
              </Link>
            </ListItem>
            ))
          }
        </List>
      </TabPanel>
    </>
  )
}

export default PersonalCard;

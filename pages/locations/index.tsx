import type { NextApiRequest, NextApiResponse, NextPage } from 'next'
import Head from 'next/head'
import Layout from '../../shared-components/layout'
import styles from '../../styles/Locations.module.css'
import { useState, useEffect } from 'react';
import { loadLocations } from '../../lib/location.service';
import { ILocation } from '../../models/location';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import LocationsTab from './components/locations-tab';
import CustomLocationsTab from './components/custom-locations-tab';
import YourLocationsTab from './components/your-locations-tab';
import { useRouter } from 'next/router';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Locations: NextPage = (props: any) => {
  const router = useRouter();
  const { id } = router.query;
  const loadId = id as string;

  const user = props.user;
  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];
  const locationName = locations.find(e => e.code === location)?.name;

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  //Change to custom locations if there is a loadId
  useEffect(() => {
    if (loadId) {
      setTabIndex(1);
    }
  }, []);

  return (
    <Layout>
      <Head>
        <title>Locations</title>
        <meta name="description" content="CovidTracker Locations" />
      </Head>

      <section className={styles.page_container}>
        <h1>Locations</h1>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="Locations Tab">
            <Tab label="Locations" />
            <Tab label="Custom Locations" />
            <Tab label="Your Locations" disabled={!user}/>
          </Tabs>
        </Box>

        <TabPanel value={tabIndex} index={0}>
          <LocationsTab location={location} locations={locations} />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <CustomLocationsTab user={user}/>
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <YourLocationsTab user={user}/>
        </TabPanel>
      </section>
    </Layout>
  )
}

export async function getServerSideProps({req, res}: {req: NextApiRequest, res: NextApiResponse}) {
  const locations: ILocation[] = await loadLocations();
  const location = req.cookies.user ? JSON.parse(req.cookies.user).location_code : 'ROU';
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  return { props: {
    location: location,
    locations: locations,
    user: user,
  } };
}

export default Locations

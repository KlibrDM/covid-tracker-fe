import type { NextApiRequest, NextApiResponse, NextPage } from 'next'
import Head from 'next/head'
import Layout from '../../components/layout'
import styles from '../../styles/Locations.module.css'
import { useState } from 'react';
import { loadLocations } from '../../lib/load-locations';
import { ILocation } from '../../models/location';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

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
  const [location, setLocation] = useState(props.location as string);
  const locations = props.locations as ILocation[];
  const locationName = locations.find(e => e.code === location)?.name;

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

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
            <Tab label="Manage Locations" />
          </Tabs>
        </Box>
        <TabPanel value={tabIndex} index={0}>
          <div className={styles.locations_tab_container}>
            {
              locations.map((location) => (
                <Card key={location.code} className={styles.locations_card}>
                  <CardContent>
                    <h4>{location.name}</h4>
                    <p>Type: {location.type !== 'owidcat' ? location.type.slice(0,1).toUpperCase() + location.type.slice(1) : 'Custom'}</p>
                    {location.continent && <p>Continent: {location.continent}</p>}
                    {location.population && <p>Population: {location.population}</p>}
                    {location.population_density && <p>Population density: {location.population_density}</p>}
                    {location.median_age && <p>Median age: {location.median_age}</p>}
                    {location.aged_65_older && <p>Citizens aged 65 or older: {location.aged_65_older}</p>}
                    {location.hospital_beds_per_thousand && <p>Hospital beds/1k: {location.hospital_beds_per_thousand}</p>}
                  </CardContent>
                </Card>
              ))
            }
          </div>
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>

        </TabPanel>
        <TabPanel value={tabIndex} index={2}>

        </TabPanel>
      </section>
    </Layout>
  )
}

export async function getServerSideProps({req, res}: {req: NextApiRequest, res: NextApiResponse}) {
  const locations: ILocation[] = await loadLocations();
  const location = req.cookies.user ? JSON.parse(req.cookies.user).location_code : 'ROU';

  return { props: {
    location: location,
    locations: locations,
  } };
}

export default Locations

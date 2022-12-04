import styles from '../styles/Nav.module.css'
import Link from 'next/link'
import { useRouter } from 'next/router';
import Login from './login';
import {withCookies} from 'react-cookie';
import Register from './register';
import SignOut from './sign-out';
import { useEffect, useState } from 'react';
import { IUser } from '../models/user';
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SickIcon from '@mui/icons-material/Sick';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import BiotechIcon from '@mui/icons-material/Biotech';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AddchartIcon from '@mui/icons-material/Addchart';
import InsightsIcon from '@mui/icons-material/Insights';
import InfoIcon from '@mui/icons-material/Info';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';

const Nav = (props: any) => {
  const {cookies} = props;
  const [user, setuser] = useState<IUser | undefined>(undefined);
  const [cookiesLoaded, setcookiesLoaded] = useState<boolean>(false);
  const [quickChartsOpen, setQuickChartsOpen] = useState(false);
  
  useEffect(() => {
    setuser(cookies.get('user'));
    setcookiesLoaded(true);
  }, []);

  const router = useRouter();
  const currentRoute = router.pathname;

  const handleQuickChartsClick = () => {
    setQuickChartsOpen(!quickChartsOpen);
  };

  return (
    <div className={styles.nav}>
      <div className={styles.nav_header}>
        <h2 className={styles.nav_header_title}>CovidTracker</h2>
        <p className={styles.nav_header_subtitle}>Statistics Dashboard</p>
      </div>
      <div className={styles.nav_items}>
        <List component="nav" aria-labelledby="navbar">
          <Link href="/">
            <ListItemButton sx={{padding: 1}} selected={currentRoute === '/'}>
              <ListItemIcon sx={{minWidth: 36}}>
                <HomeIcon sx={{color: 'white'}} />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </Link>

          <ListItemButton
            onClick={handleQuickChartsClick}
            sx={{padding: 1}}
            selected={
              currentRoute === '/cases'
              || currentRoute === '/deaths'
              || currentRoute === '/testing'
              || currentRoute === '/vaccines'
              || currentRoute === '/hospitalizations'
            }>
            <ListItemIcon sx={{minWidth: 36}}>
              <QueryStatsIcon sx={{color: 'white'}} />
            </ListItemIcon>
            <ListItemText primary="Quick Charts" />
            {quickChartsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={quickChartsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <Link href="/cases">
                <ListItemButton sx={{ pr: 1, pl: 2 }} selected={currentRoute === '/cases'}>
                  <ListItemIcon sx={{minWidth: 36}}>
                    <SickIcon sx={{color: 'white'}} />
                  </ListItemIcon>
                  <ListItemText primary="Cases" />
                </ListItemButton>
              </Link>

              <Link href="/deaths">
                <ListItemButton sx={{ pr: 1, pl: 2 }} selected={currentRoute === '/deaths'}>
                  <ListItemIcon sx={{minWidth: 36}}>
                    <CoronavirusIcon sx={{color: 'white'}} />
                  </ListItemIcon>
                  <ListItemText primary="Deaths" />
                </ListItemButton>
              </Link>

              <Link href="/testing">
                <ListItemButton sx={{ pr: 1, pl: 2 }} selected={currentRoute === '/testing'}>
                  <ListItemIcon sx={{minWidth: 36}}>
                    <BiotechIcon sx={{color: 'white'}} />
                  </ListItemIcon>
                  <ListItemText primary="Testing" />
                </ListItemButton>
              </Link>

              <Link href="/vaccinations">
                <ListItemButton sx={{ pr: 1, pl: 2 }} selected={currentRoute === '/vaccinations'}>
                  <ListItemIcon sx={{minWidth: 36}}>
                    <VaccinesIcon sx={{color: 'white'}} />
                  </ListItemIcon>
                  <ListItemText primary="Vaccinations" />
                </ListItemButton>
              </Link>

              <Link href="/hospitalizations">
                <ListItemButton sx={{ pr: 1, pl: 2 }} selected={currentRoute === '/hospitalizations'}>
                  <ListItemIcon sx={{minWidth: 36}}>
                    <LocalHospitalIcon sx={{color: 'white'}} />
                  </ListItemIcon>
                  <ListItemText primary="Hospitalizations" />
                </ListItemButton>
              </Link>
            </List>
          </Collapse>

          <Link href="/locations">
            <ListItemButton sx={{padding: 1}} selected={currentRoute === '/locations'}>
              <ListItemIcon sx={{minWidth: 36}}>
                <LocationOnIcon sx={{color: 'white'}} />
              </ListItemIcon>
              <ListItemText primary="Locations" />
            </ListItemButton>
          </Link>

          <Link href="/builder">
            <ListItemButton sx={{padding: 1}} selected={currentRoute === '/builder'}>
              <ListItemIcon sx={{minWidth: 36}}>
                <AddchartIcon sx={{color: 'white'}} />
              </ListItemIcon>
              <ListItemText primary="Chart Builder" />
            </ListItemButton>
          </Link>

          <Link href="/report">
            <ListItemButton sx={{padding: 1}} selected={currentRoute === '/report'}>
              <ListItemIcon sx={{minWidth: 36}}>
                <DescriptionIcon sx={{color: 'white'}} />
              </ListItemIcon>
              <ListItemText primary="Report" />
            </ListItemButton>
          </Link>

          <Link href="/simulation">
            <ListItemButton sx={{padding: 1}} selected={currentRoute === '/simulation'}>
              <ListItemIcon sx={{minWidth: 36}}>
                <InsightsIcon sx={{color: 'white'}} />
              </ListItemIcon>
              <ListItemText primary="Simulation" />
            </ListItemButton>
          </Link>

          <Link href="/about">
            <ListItemButton sx={{padding: 1}} selected={currentRoute === '/about'}>
              <ListItemIcon sx={{minWidth: 36}}>
                <InfoIcon sx={{color: 'white'}} />
              </ListItemIcon>
              <ListItemText primary="About" />
            </ListItemButton>
          </Link>
        </List>
      </div>

      <div className={styles.nav_user}>
        {
          cookiesLoaded ? !user
          ?
          <>
            <Login />
            <Register />
          </>
          :
          <>
            <SignOut />
          </> : <></>
        }
      </div>
    </div>
  )
}

export default withCookies(Nav);

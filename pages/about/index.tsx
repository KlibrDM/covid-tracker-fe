import type { NextPage } from 'next'
import styles from '../../styles/About.module.css'
import Head from 'next/head'
import Layout from '../../shared-components/layout'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'

const About: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>About</title>
        <meta name="description" content="CovidTracker About" />
      </Head>

      <section className={styles.page_container}>
        <h1>About</h1>
        <h3>Data on COVID-19 (coronavirus) by
          <a href='https://ourworldindata.org/explorers/coronavirus-data-explorer' className={styles.link}> Our World in Data</a>
        </h3>
        <p>It includes the following data:</p>
        <div>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="table">
              <TableHead>
                <TableRow>
                  <TableCell>Metrics</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell>Countries</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Vaccinations</TableCell>
                  <TableCell>Official data collated by the Our World in Data team</TableCell>
                  <TableCell>Daily</TableCell>
                  <TableCell>218</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Tests & positivity</TableCell>
                  <TableCell>Official data collated by the Our World in Data team</TableCell>
                  <TableCell>No longer updated</TableCell>
                  <TableCell>193</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Hospital & ICU</TableCell>
                  <TableCell>Official data collated by the Our World in Data team</TableCell>
                  <TableCell>Daily</TableCell>
                  <TableCell>47</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Confirmed cases</TableCell>
                  <TableCell>JHU CSSE COVID-19 Data</TableCell>
                  <TableCell>Daily</TableCell>
                  <TableCell>219</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Confirmed deaths</TableCell>
                  <TableCell>JHU CSSE COVID-19 Data</TableCell>
                  <TableCell>Daily</TableCell>
                  <TableCell>219</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Reproduction rate</TableCell>
                  <TableCell>Arroyo-Marioli F, Bullano F, Kucinskas S, Rondón-Moreno C</TableCell>
                  <TableCell>Daily</TableCell>
                  <TableCell>196</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Policy responses</TableCell>
                  <TableCell>Oxford COVID-19 Government Response Tracker</TableCell>
                  <TableCell>Daily</TableCell>
                  <TableCell>187</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Other variables of interest</TableCell>
                  <TableCell>International organizations (UN, World Bank, OECD, IHME…)</TableCell>
                  <TableCell>Fixed</TableCell>
                  <TableCell>241</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <h3 className={styles.big_margin_title}>Indicator definitions</h3>
        <div>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="table">
              <TableHead>
                <TableRow>
                  <TableCell>Indicator</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>New cases</TableCell>
                  <TableCell>New confirmed cases of COVID-19. Counts can include probable cases, where reported.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Total cases</TableCell>
                  <TableCell>Total confirmed cases of COVID-19. Counts can include probable cases, where reported.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Reproduction rate</TableCell>
                  <TableCell>Real-time estimate of the effective reproduction rate (R) of COVID-19.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Stringency index</TableCell>
                  <TableCell>Government Response Stringency Index: composite measure based on 9 response indicators including school closures, workplace closures, and travel bans, rescaled to a value from 0 to 100 (100 = strictest response)</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>New deaths</TableCell>
                  <TableCell>New deaths attributed to COVID-19. Counts can include probable deaths, where reported.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Total deaths</TableCell>
                  <TableCell>Total deaths attributed to COVID-19. Counts can include probable deaths, where reported.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Excess mortality</TableCell>
                  <TableCell>Percentage difference between the reported number of weekly or monthly deaths in 2020-2021 and the projected number of deaths for the same period based on previous years.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Excess mortality cumulative</TableCell>
                  <TableCell>Percentage difference between the cumulative number of deaths since 1 January 2020 and the cumulative projected deaths for the same period based on previous years.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>New tests</TableCell>
                  <TableCell>New tests for COVID-19.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Total tests</TableCell>
                  <TableCell>Total tests for COVID-19.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Positivity rate</TableCell>
                  <TableCell>The share of COVID-19 tests that are positive, given as a rolling 7-day average.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>People vaccinated</TableCell>
                  <TableCell>Total number of people who received at least one vaccine dose.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>People fully vaccinated</TableCell>
                  <TableCell>Total number of people who received all doses prescribed by the initial vaccination protocol.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Total boosters</TableCell>
                  <TableCell>Total number of COVID-19 vaccination booster doses administered (doses administered beyond the number prescribed by the vaccination protocol).</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>New vaccinations</TableCell>
                  <TableCell>New COVID-19 vaccination doses administered.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Total vaccinations</TableCell>
                  <TableCell>Total number of COVID-19 vaccination doses administered.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Hospital patients</TableCell>
                  <TableCell>Number of COVID-19 patients in hospital on a given day.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>ICU patients</TableCell>
                  <TableCell>Number of COVID-19 patients in intensive care units (ICUs) on a given day.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Weekly hospital admissions</TableCell>
                  <TableCell>Number of COVID-19 patients newly admitted to hospitals in a given week (reporting date and the preceeding 6 days).</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Weekly ICU admissions</TableCell>
                  <TableCell>Number of COVID-19 patients newly admitted to intensive care units (ICUs) in a given week (reporting date and the preceeding 6 days).</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Population density</TableCell>
                  <TableCell>Number of people divided by land area, measured in square kilometers, most recent year available.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Median age</TableCell>
                  <TableCell>Median age of the population, UN projection for 2020.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Aged 65+</TableCell>
                  <TableCell>Share of the population that is 65 years and older, most recent year available.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Hospital beds per 1k</TableCell>
                  <TableCell>Hospital beds per 1,000 people, most recent year available since 2010.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>GDP per capita</TableCell>
                  <TableCell>Gross domestic product at purchasing power parity (constant 2011 international dollars), most recent year available.</TableCell>
                </TableRow>
                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>Life expectancy</TableCell>
                  <TableCell>Life expectancy at birth in 2019.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <h3 className={styles.big_margin_title}>MIT License</h3>
        <p>Copyright (c) 2022 Patrick</p>
        <p>
          Permission is hereby granted, free of charge, to any person obtaining a copy
          of this software and associated documentation files (the &quot;Software&quot;), to deal
          in the Software without restriction, including without limitation the rights
          to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
          copies of the Software, and to permit persons to whom the Software is
          furnished to do so, subject to the following conditions:
        </p>
        <p>
          The above copyright notice and this permission notice shall be included in all
          copies or substantial portions of the Software.
        </p>
        <p>
          THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
          IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
          AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
          LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
          OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
          SOFTWARE.
        </p>
        <p>Application available at: <a href='https://github.com/KlibrDM/covid-tracker-fe' className={styles.link}>https://github.com/KlibrDM/covid-tracker-fe</a></p>
        <p>API available at: <a href='https://github.com/KlibrDM/covid-tracker-api' className={styles.link}>https://github.com/KlibrDM/covid-tracker-api</a></p>
      </section>
    </Layout>
  )
}

export default About

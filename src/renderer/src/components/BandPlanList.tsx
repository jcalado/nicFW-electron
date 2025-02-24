import {
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Title1,
  Toolbar,
  ToolbarButton,
  ToolbarDivider
} from '@fluentui/react-components'
import { ArrowDownloadRegular, ArrowUploadRegular, DocumentBulletListRegular, SaveRegular } from '@fluentui/react-icons'
import React, { useState, useEffect } from 'react'
import { toDecimalFreq } from '../../../utils/converters.js'

function BandPlanList({ bands, isConnected, onBandsReceived }) {

  useEffect(() => {
    console.log("fetching bandplan")
    const fetchBandPlan = async () => {
      try {
        const bands = await window.api.readBandPlan().then((data) => {
          onBandsReceived(data)
        }).catch((error) => {
          console.error('Error reading bandplan:', error)
        })

      } catch (error) {
        console.error('Error fetching bandplan:', error)
      }
    }

    fetchBandPlan()
  }, [])

  const columns = [
    { columnKey: 'bandNumber', label: 'Number' },
    { columnKey: 'start', label: 'Start' },
    { columnKey: 'end', label: 'End' },
    { columnKey: 'maxPower', label: 'Max Power' },
    { columnKey: 'txAllowed', label: 'TX allowed' },
    { columnKey: 'wrap', label: 'Wrap' },
    { columnKey: 'modulation', label: 'Modulation' },
    { columnKey: 'bandwidth', label: 'Bandwidth' }
  ]

  const readBandPlan = () => {
    const result = window.api
      .readBandPlan()
      .then((data) => {
        console.log(data)
        onBandsReceived(data)
      })
      .catch((error) => {
        console.error('Error reading bandplan:', error)
      })
  }

  return (
    <div>
      <Toolbar>
        <ToolbarButton
          onClick={() => readBandPlan()}
          disabled={!isConnected}
          vertical
          appearance="primary"
          icon={<ArrowDownloadRegular />}
        >
          Read
        </ToolbarButton>
        <ToolbarButton
          onClick={() => readBandPlan()}
          disabled={!isConnected}
          vertical
          icon={<ArrowUploadRegular />}
        >
          Write
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => readBandPlan()} vertical icon={<SaveRegular />}>
          Save
        </ToolbarButton>
        <ToolbarButton onClick={() => readBandPlan()} vertical icon={<DocumentBulletListRegular />}>
          Load
        </ToolbarButton>
      </Toolbar>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bands &&
            bands.length > 0 &&
            bands.map((band) => (
              <TableRow key={band.bandNumber}>
                <TableCell key={band.bandNumber}>{band.bandNumber}</TableCell>
                <TableCell key={band.start}>{band.start} MHz</TableCell>
                <TableCell key={band.end}>{band.end} MHz</TableCell>
                <TableCell key={band.maxPower}>{band.maxPower}</TableCell>
                <TableCell key={band.txAllowed}>
                  {band.txAllowed ? <Checkbox checked={true} /> : <Checkbox />}
                </TableCell>
                <TableCell key={band.wrap}>
                  {band.wrap ? <Checkbox checked={true} /> : <Checkbox />}
                </TableCell>
                <TableCell key={band.modulation}>{band.modulation}</TableCell>
                <TableCell key={band.bandwidth}>{band.bandwidth}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
export default BandPlanList

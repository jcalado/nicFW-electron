import {
  Button,
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
import { ArrowDownloadRegular, DocumentBulletListRegular, SaveRegular } from '@fluentui/react-icons'
import React, { useState } from 'react'

function GroupList({ groups, isConnected, onGroupsReceived }) {

  const columns = [
    { columnKey: 'group', label: '🟢 Group' },
    { columnKey: 'label', label: '🏷️ Label' },
  ]

  const readGroups = () => {
    const result = window.api
      .readGroups()
      .then((data) => {
        console.log(data)
        onGroupsReceived(data)
      })
      .catch((error) => {
        console.error('Error reading groups:', error)
      })
  }

  return (
    <div>
      <Toolbar>
        <ToolbarButton
          onClick={() => readGroups()}
          disabled={!isConnected}
          vertical
          appearance="primary"
          icon={<ArrowDownloadRegular />}
        >
          Read
        </ToolbarButton>
        <ToolbarButton
          onClick={() => readGroups()}
          disabled={!isConnected}
          vertical
          icon={<ArrowDownloadRegular />}
        >
          Write
        </ToolbarButton>
        <ToolbarDivider/>
        <ToolbarButton onClick={() => readGroups()} vertical icon={<SaveRegular />}>
          Save
        </ToolbarButton>
        <ToolbarButton onClick={() => readGroups()} vertical icon={<DocumentBulletListRegular />}>
          Load
        </ToolbarButton>
      </Toolbar>

      {groups && groups.length > 0 && <p>{groups.length} groups found.</p>}

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHeaderCell key={column.columnKey}>{column.label}</TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups &&
            groups.length > 0 &&
            groups.map((group) => (
              <TableRow key={group.groupNumber}>
                <TableCell key={group.group}>{group.group}</TableCell>
                <TableCell key={group.label}>{group.label}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
export default GroupList

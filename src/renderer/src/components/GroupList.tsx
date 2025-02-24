import {
  Button,
  Input,
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

function GroupList({ groups, isConnected, onGroupsReceived }) {
  const columns = [
    { columnKey: 'group', label: 'Group' },
    { columnKey: 'label', label: 'Label' }
  ]

  const [selectedGroup, setSelectedGroup] = useState(null)

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

  const writeGroups = () => {
    console.log('Writing groups')
    console.log(groups)
    const result = window.api
      .writeGroups(groups)
      .then((data) => {
        console.log(data)
      })
      .catch((error) => {
        console.error('Error writing groups:', error)
      })
  }

  const onChange = (group, value) => {
    group.label = value
    // Update group on the groups
    const newGroups = groups.map((g) => (g.group === group.group ? group : g))
    setSelectedGroup(group)
    onGroupsReceived(newGroups)
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
          onClick={() => writeGroups()}
          disabled={!isConnected}
          vertical
          icon={<ArrowUploadRegular />}
        >
          Write
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => readGroups()} vertical icon={<SaveRegular />}>
          Save
        </ToolbarButton>
        <ToolbarButton onClick={() => readGroups()} vertical icon={<DocumentBulletListRegular />}>
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
          {groups &&
            groups.length > 0 &&
            groups.map((group) => (
              <TableRow key={group.groupNumber}>
                <TableCell key={group.group}>{group.group}</TableCell>
                <TableCell key={group.label}>
                  <Input
                    value={group.label}
                    onChange={(ev) => onChange(group, ev.currentTarget.value)}
                    autoFocus={selectedGroup === group}
                    maxLength={5}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
export default GroupList

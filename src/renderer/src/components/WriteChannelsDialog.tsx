import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle
} from '@fluentui/react-components'
import React from 'react'

interface WriteChannelsDialogProps {
  writing: boolean
  error: any
  onClose: () => void
}

function WriteChannelsDialog({ writing, error, onClose }: WriteChannelsDialogProps) {
  return (
    <Dialog open={writing || error != null}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Writing channels</DialogTitle>
          {error == null && (
            <DialogContent>
              Please wait while the channel data is written to the radio... Do not disconnect or close the application.
            </DialogContent>
          )}
          {error != null && (
            <DialogContent>
              An error occurred while writing the channel data: {error.message}
            </DialogContent>
          )}
          <DialogActions>
            <Button disabled={writing} onClick={onClose}>
              Ok
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export default WriteChannelsDialog

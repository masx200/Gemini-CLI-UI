import React, { useState } from "react";
import ModelProvidersManagement from "./ModelProvidersManagement.jsx";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  styled,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BoltIcon from "@mui/icons-material/Bolt";
export interface ModelProvidersSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 64,
  height: 64,
  margin: "0 auto 16px",
}));

const ModelProvidersSettings: React.FC<ModelProvidersSettingsProps> = (
  { isOpen, onClose },
) => {
  const [showManagement, setShowManagement] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "80vh",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Model Providers Settings
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {!showManagement
          ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <StyledAvatar>
                <BoltIcon sx={{ fontSize: 32 }} />
              </StyledAvatar>
              <Typography variant="h6" gutterBottom>
                Manage Model Providers
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Configure and manage your AI model providers including API keys
                and settings.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setShowManagement(true)}
                size="large"
              >
                Open Provider Management
              </Button>
            </Box>
          )
          : (
            <ModelProvidersManagement
              isOpen={showManagement}
              onClose={() => setShowManagement(false)}
            />
          )}
      </DialogContent>
    </Dialog>
  );
};

export default ModelProvidersSettings;

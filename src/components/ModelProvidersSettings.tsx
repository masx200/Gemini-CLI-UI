import React, { useState } from "react";
import ModelProvidersManagement from "./ModelProvidersManagement.tsx";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  styled,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BoltIcon from "@mui/icons-material/Bolt";
export interface ModelProvidersSettingsProps {}

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 64,
  height: 64,
  margin: "0 auto 16px",
}));

const ModelProvidersSettings: React.FC<
  ModelProvidersSettingsProps
> = ({}: ModelProvidersSettingsProps) => {
  const [showManagement, setShowManagement] = useState(false);

  return (
    <Card
      sx={{
        maxWidth: "md",
        margin: "auto",
        maxHeight: "80vh",
        overflow: "hidden",
      }}
    >
      <CardHeader
        title="Model Providers Settings"
        action={
          <IconButton
            aria-label="close"
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
           
          </IconButton>
        }
      />
      <CardContent sx={{ overflow: "auto" }}>
        {!showManagement ? (
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
        ) : (
          <ModelProvidersManagement
            isOpen={showManagement}
            onClose={() => setShowManagement(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ModelProvidersSettings;

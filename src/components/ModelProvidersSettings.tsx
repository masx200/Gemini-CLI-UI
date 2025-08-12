import BoltIcon from "@mui/icons-material/Bolt";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  MenuItem,
  Select,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import ModelProvidersManagement, {
  type Provider,
} from "./ModelProvidersManagement.tsx";
export interface ModelProvidersSettingsProps {}

//@ts-ignore
import { authenticatedFetch } from "../../src/utils/api.js";
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 64,
  height: 64,
  margin: "0 auto 16px",
}));

const ModelProvidersSettings: React.FC<
  ModelProvidersSettingsProps
> = ({}: ModelProvidersSettingsProps) => {
  useEffect(() => {
    loadProviders();
  }, []);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [showManagement, setShowManagement] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch("/api/model-providers/list");
      const data = await response.json();
      setProviders(data.providers || []);
      setSelectedProvider(data.providers[0]?.provider_name || "");
    } catch (error) {
      console.error("Error loading providers:", error);
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

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
        {!showManagement
          ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                alignContent="center"
                justifyContent="center"
              >
                <StyledAvatar>
                  <BoltIcon sx={{ fontSize: 32 }} />
                </StyledAvatar>
                <span>当前选择的模型供应商</span>
                {isLoading
                  ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 256,
                      }}
                    >
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600">
                      </div>
                    </Box>
                  )
                  : (
                    <Select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                    >
                      {providers.map((provider) => (
                        <MenuItem
                          key={provider.provider_name}
                          value={provider.provider_name}
                        >
                          {provider.provider_name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
              </Stack>

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
      </CardContent>
    </Card>
  );
};

export default ModelProvidersSettings;

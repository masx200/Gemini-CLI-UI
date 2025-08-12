import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import ModelProvidersManagement from "./ModelProvidersManagement.jsx";
import { Avatar, Box, Button, Card, CardContent, CardHeader, IconButton, styled, Typography, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BoltIcon from "@mui/icons-material/Bolt";
const StyledAvatar = styled(Avatar)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    width: 64,
    height: 64,
    margin: "0 auto 16px",
}));
const ModelProvidersSettings = ({}) => {
    const [showManagement, setShowManagement] = useState(false);
    return (_jsxs(Card, { sx: {
            maxWidth: "md",
            margin: "auto",
            maxHeight: "80vh",
            overflow: "hidden",
        }, children: [_jsx(CardHeader, { title: "Model Providers Settings", action: _jsx(IconButton, { "aria-label": "close", sx: {
                        color: (theme) => theme.palette.grey[500],
                    } }) }), _jsx(CardContent, { sx: { overflow: "auto" }, children: !showManagement ? (_jsxs(Box, { sx: { textAlign: "center", py: 4 }, children: [_jsx(StyledAvatar, { children: _jsx(BoltIcon, { sx: { fontSize: 32 } }) }), _jsx(Typography, { variant: "h6", gutterBottom: true, children: "Manage Model Providers" }), _jsx(Typography, { variant: "body1", color: "text.secondary", paragraph: true, children: "Configure and manage your AI model providers including API keys and settings." }), _jsx(Button, { variant: "contained", onClick: () => setShowManagement(true), size: "large", children: "Open Provider Management" })] })) : (_jsx(ModelProvidersManagement, { isOpen: showManagement, onClose: () => setShowManagement(false) })) })] }));
};
export default ModelProvidersSettings;
//# sourceMappingURL=ModelProvidersSettings.js.map
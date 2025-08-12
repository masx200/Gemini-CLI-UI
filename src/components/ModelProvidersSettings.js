import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import ModelProvidersManagement from "./ModelProvidersManagement.jsx";
import { Avatar, Box, Button, Dialog, DialogContent, DialogTitle, IconButton, styled, Typography, } from "@mui/material";
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
    return (_jsxs(Dialog, { open: isOpen, onClose: onClose, maxWidth: "md", fullWidth: true, PaperProps: {
            sx: {
                maxHeight: "80vh",
                overflow: "hidden",
            },
        }, children: [_jsxs(DialogTitle, { sx: { m: 0, p: 2 }, children: ["Model Providers Settings", _jsx(IconButton, { "aria-label": "close", onClick: onClose, sx: {
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }, children: _jsx(CloseIcon, {}) })] }), _jsx(DialogContent, { dividers: true, children: !showManagement ? (_jsxs(Box, { sx: { textAlign: "center", py: 4 }, children: [_jsx(StyledAvatar, { children: _jsx(BoltIcon, { sx: { fontSize: 32 } }) }), _jsx(Typography, { variant: "h6", gutterBottom: true, children: "Manage Model Providers" }), _jsx(Typography, { variant: "body1", color: "text.secondary", paragraph: true, children: "Configure and manage your AI model providers including API keys and settings." }), _jsx(Button, { variant: "contained", onClick: () => setShowManagement(true), size: "large", children: "Open Provider Management" })] })) : (_jsx(ModelProvidersManagement, { isOpen: showManagement, onClose: () => setShowManagement(false) })) })] }));
};
export default ModelProvidersSettings;
//# sourceMappingURL=ModelProvidersSettings.js.map
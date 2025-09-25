import { ListItem, ListItemAvatar } from "@mui/material";
import { Avatar, Box, Typography } from "@mui/material";

export interface Message {
  sender: string;
  text: string;
  sentAt: string;
}
export default function MessageItem({ msg, isUser, avatarSrc }: { msg: Message, isUser: boolean, avatarSrc?: string }) {
  const time = msg.sentAt
  // bubble corner styling: make a little "tail" effect by changing one corner radius
  const bubbleStyle = isUser
    ? { borderRadius: "16px 16px 4px 16px" } // user: smaller bottom-right corner
    : { borderRadius: "16px 16px 16px 4px" }; // bot: smaller bottom-left corner

  return (
    <ListItem
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-start",
        py: 0.5,
        px: 1.5,
        marginBottom: 1,
      }}
      disableGutters
    >
      {/* bot: avatar left, user: avatar right */}
      {!isUser && (
        <ListItemAvatar>
          <Avatar alt={msg.sender} src={avatarSrc}>
            {msg.sender?.[0]}
          </Avatar>
        </ListItemAvatar>
      )}

      <Box
        sx={{
          maxWidth: "72%",
          bgcolor: isUser ? "primary.main" : "background.paper",
          color: isUser ? "primary.contrastText" : "text.primary",
          p: 1,
          ml: !isUser ? 1 : 0,
          mr: isUser ? 1 : 0,
          ...bubbleStyle,
          boxShadow: 1,
          whiteSpace: "pre-line",
         
        }}
      >
        <Typography  variant="body2">{msg.text}</Typography>
        <Typography variant="caption" sx={{ display: "block", mt: 0.5, opacity: 0.7, textAlign: isUser ? "right" : "left" }}>
          {time}
        </Typography>
      </Box>

      {isUser && (
        <ListItemAvatar>
          <Avatar alt={msg.sender} src={avatarSrc}>
            {msg.sender?.[0]}
          </Avatar>
        </ListItemAvatar>
      )}
    </ListItem>
  );
}
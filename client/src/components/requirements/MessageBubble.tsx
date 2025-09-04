interface MessageBubbleProps {
  message: {
    _id: string;
    text: string;
    createdAt: string;
    senderId: string;
    sender?: {
      id: string;
      name: string;
      profileImage?: string;
    };
  };
  isOwnMessage: boolean;
}

const MessageBubble = ({ message, isOwnMessage }: MessageBubbleProps) => {
  // Fallback values for sender
  const senderName = message.sender?.name || "Unknown User";
  const senderProfileImage = message.sender?.profileImage || "/default-avatar.png";

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[75%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwnMessage && (
          <div className="flex-shrink-0 mr-2">
            <img
              src={senderProfileImage}
              alt={senderName}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        )}
        
        {/* Message Content */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {/* Sender Name (only for received messages) */}
          {!isOwnMessage && (
            <span className="text-xs text-gray-600 mb-1 ml-2">
              {senderName}
            </span>
          )}
          
          {/* Message Bubble */}
          <div
            className={`px-4 py-2 rounded-2xl max-w-full break-words ${
              isOwnMessage
                ? 'bg-primary text-white rounded-br-md'
                : 'bg-gray-100 text-darkBg rounded-bl-md'
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
          
          {/* Timestamp */}
          <span className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
            {new Date(message.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

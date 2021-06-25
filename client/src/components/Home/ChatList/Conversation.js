import { ListItem,ListItemSecondaryAction, ListItemAvatar, ListItemText, Avatar as OAvatar, useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import FiberNewIcon from '@material-ui/icons/FiberNew';
import React, { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectConversation } from '../../../actions/chat';
import Avatar from '../Avatar';
import { SocketContext } from '../../../context.socket';
import AvatarGroup from '@material-ui/lab/AvatarGroup';

 
const useStyles = makeStyles(() => ({
    conversation: {
        height: 80,
        minWidth: 100,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        '&:hover': {
            backgroundColor: '#e0f1fb',
            cursor: 'pointer',
            borderRadius: '5px',
        },
        '& .MuiListItemText-primary': {
            color: '#5B9BD5',
           
            fontSize: '15px',
            marginLeft: 5
        },
        '& .MuiListItemText-secondary': {
            marginLeft: 5
        }
    },
    icon: {
        diplay: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    newSec: {      
        fontWeight: 'bold', 
    },
    newPri : {
         
        fontWeight: 'bold !important', 
    },
    selected: {
        backgroundColor: '#e0f1fb',
        borderRadius: '5px',
    },
}));

 
const Conversation = ({ conversation }) => {

    /* const match900 = useMediaQuery('(max-width: 900px)'); */
    const { mode } = useSelector(state => state.layout);
     
    const currentUser = JSON.parse(localStorage.getItem('profile')).result;

    const socket = useContext(SocketContext);

    const [isRead, setIsRead] = useState(conversation?.lastMessageInfo[0]?.isReadBy?.some(readerId => readerId === currentUser?._id));
    const currentConversation = useSelector(state => state.conversation);

    const dispatch = useDispatch();
    const classes = useStyles();

    useEffect(() => {
        setIsRead(conversation?.lastMessageInfo[0]?.isReadBy?.some(readerId => readerId === currentUser._id));
        if (currentConversation?._id === conversation?._id) {
            socket.emit('userReadLastMessage', { conversationId: conversation?._id, messageId: conversation.lastMessageInfo[0]._id, userId: currentUser?._id });
            setIsRead(true);
        }
    }, [conversation])

    let name = "";
    let lastMessage = "";
    let partner = conversation.peopleInfo?.find(x => x._id !== currentUser._id);

    const isGroupConversation = conversation.name ? true : false
    const lastMessageSender = conversation?.lastMessageInfo[0]?.senderInfo[0];

    if (isGroupConversation) {
        name = conversation.name;
    } else {
        name = ` ${partner.lastname} ${partner.firstname}`;
    }

    if (!conversation.lastMessageInfo[0]?.text && !conversation.lastMessageInfo[0]?.attachment) {
        lastMessage = currentUser._id === conversation.host ? `You have created a group chat !` : `${conversation.hostInfo[0]?.lastname} has recently added you`
    }
    else if (conversation.lastMessageInfo[0].attachment) {
        lastMessage = currentUser._id === conversation.lastMessageInfo[0].sender ? `You have sent an image` : (isGroupConversation ? `${lastMessageSender.firstname} have sent an image` : "Sent an image");
    }
    else {
        if (conversation?.lastMessageInfo[0]?.text.length < 25) {
            lastMessage = currentUser._id === conversation.lastMessageInfo[0].sender ? `You: ${conversation?.lastMessageInfo[0]?.text}` : (isGroupConversation ? `${lastMessageSender.firstname}: ${conversation?.lastMessageInfo[0]?.text}` : conversation?.lastMessageInfo[0]?.text);
        } else {
            lastMessage = conversation?.lastMessageInfo[0]?.text;
            lastMessage = lastMessage?.substring(0, 25)
            lastMessage = `${lastMessage}...`;
            lastMessage = currentUser._id === conversation.lastMessageInfo[0].sender ? `You: ${lastMessage}` : (isGroupConversation ? `${lastMessageSender.firstname}: ${lastMessage}` : lastMessage);
        }
    }

    const handleSelect = () => {
        if (!isRead) {
            socket.emit('userReadLastMessage', { conversationId: conversation?._id, messageId: conversation.lastMessageInfo[0]._id, userId: currentUser?._id });
            setIsRead(true);
        }
        dispatch(selectConversation(conversation));
    }

    if(mode === 'SM') {
        return(
            <ListItem onClick={handleSelect} className={currentConversation?._id !== conversation._id ? classes.conversation : `${classes.conversation} ${classes.selected}`} alignItems="center">
            <ListItemAvatar>
                {
                    !isRead ? <FiberNewIcon style={{ fontSize: 20, color: '#54a2dd', position: 'relative', top: 13, right: 13}}/> : null 
                }
                {
                    !conversation?.name ?  <Avatar url={partner.avatar} size={50} type={1} userId={partner._id} /> :
                    (
                        <AvatarGroup  max={2} spacing={23}>
                            {
                                <OAvatar src={conversation?.hostInfo[0]?.avatar}/>
                            }
                            {
                                conversation?.peopleInfo.map((member) => {if(member._id !== conversation.host) return <OAvatar src={member.avatar} /> })
                            }    
                        </AvatarGroup>
                    )

                }
               
            </ListItemAvatar>
          
        </ListItem>
    
        )
    }

    return (
        <ListItem onClick={handleSelect} className={currentConversation?._id !== conversation._id ? classes.conversation : `${classes.conversation} ${classes.selected}`} alignItems="center">
            <ListItemAvatar>
                {
                    !conversation?.name ?  <Avatar url={partner.avatar} size={50} type={1} userId={partner._id} /> :
                    (
                        <AvatarGroup  max={2} spacing={25}>
                            {
                                <OAvatar src={conversation?.hostInfo[0]?.avatar}/>
                            }
                            {
                                conversation?.peopleInfo.map((member) => {if(member._id !== conversation.host) return <OAvatar src={member.avatar} /> })
                            }    
                        </AvatarGroup>
                    )

                }
            </ListItemAvatar>
            <ListItemText
                primary={name}
                secondary={lastMessage} 
                classes={{secondary: !isRead ? classes.newSec : null, primary:!isRead ? classes.newPri : null }}
                />
        </ListItem>
    )
}

export default Conversation;
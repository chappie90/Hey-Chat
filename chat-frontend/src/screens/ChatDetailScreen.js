import RemoveSocketIoWarning from '../components/RemoveSocketIoWarning';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import io from 'socket.io-client';
import { GiftedChat } from 'react-native-gifted-chat';

import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
// import { AsyncStorage } from 'react-native';

const ChatDetailScreen = ({ navigation }) => {
  const { state: { username } } = useContext(AuthContext);
  const { state: { chat }, getMessages } = useContext(ChatContext);
  const [incomingMsgs, setIncomingMsgs] = useState([]);
  const [receiver, setReceiver] = useState('');
  const socket = useRef(null);

  useEffect(() => {
    setReceiver(navigation.getParam('username'));
    const recipient = navigation.getParam('username');
    getMessages({ username, recipient });
    // setIncomingMsgs(chat);
    socket.current = io('http://192.168.1.108:3001');
    socket.current.on('message', message => {
      // console.log(chat);
      // setIncomingMsgs(prevState => GiftedChat.append(prevState, message));
    });
  }, []);

  const sendMessage = (message) => {
    const msgObj = {
      from: username,
      to: receiver,
      message
    };
    socket.current.emit('message', msgObj);
    setIncomingMsgs(prevState => GiftedChat.append(prevState, message));
  };

  function showMsgs(chat) {
    return chat.map(msg => msg.to);
  }

  return (
    <View style={styles.container}>
      <GiftedChat
        renderUsernameOnMessage 
        messages={chat} 
        onSend={sendMessage} 
        user={{ _id: 1 }} />
    </View>
  );
};

ChatDetailScreen.navigationOptions = ({ navigation }) => {
  const { state: { params = {} } } = navigation;
  return {
    title: params.username || ''
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default ChatDetailScreen;
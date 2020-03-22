import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  Image,
  TextInput,
  StyleSheet, 
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Modal as ScreenModal 
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons, Ionicons, AntDesign } from "@expo/vector-icons";
import Modal from "react-native-modal";
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';

import { Context as AuthContext } from '../context/AuthContext';
import { Context as ChatContext } from '../context/ChatContext';
import { Context as GroupsContext } from '../context/GroupsContext';
import AuthForm from '../components/AuthForm';
import Colors from '../constants/colors';
import HeadingText from '../components/HeadingText';
import BodyText from "../components/BodyText";

const GroupSettingsScreen = (props) => {
  const { state: { username, userId } } = useContext(AuthContext);
  const { state: { previousChats }, getChats } = useContext(ChatContext);
  const {
    state: { 
      currentGroupId,
      group 
    }, 
    getGroup, 
    leaveGroup, 
    updateGroupImage,
    deleteGroupImage 
  } = useContext(GroupsContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editName, setEditName] = useState(false);
  let nameInput;

  useEffect(() => {
    getGroup(currentGroupId).then(res => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    setName(group.name);
  }, [group]);

  const avatarEditHandler = () => {
    setModalVisible(true);
  };

  const modalCloseHandler = () => {
    setModalVisible(false);
  };

  const editNameHandler = () => {
    setEditName(true);
    nameInput.focus();
  };

  const getCameraPermissions = async () => {
    const response = await Permissions.askAsync(
      Permissions.CAMERA,
      Permissions.CAMERA_ROLL
    );
    if (response.status !== "granted") {
      Alert.alert(
        "You don't have the required permissions to access the camera",
        [{ text: "Okay" }]
      );
      return false;
    }
    return true;
  };

  const getImageLibraryPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (response.status !== "granted") {
      Alert.alert(
        "You don't have the required permissions to access the image library",
        [{ text: "Okay" }]
      );
      return false;
    }
    return true;
  };

  const takePhotoHandler = async () => {
    const hasCameraPermissions = await getCameraPermissions();
    if (!hasCameraPermissions) {
      return;
    }
    const cameraImage = await ImagePicker.launchCameraAsync({
      allowsEditing: true
    });
    if (!cameraImage.uri) {
      return;
    }
    setModalVisible(false);
    updateGroupImage(username, group._id, group.name, cameraImage.uri);
  };

  const choosePhotoHandler = async () => {
    const hasImageLibraryPermissions = await getImageLibraryPermissions();
    if (!hasImageLibraryPermissions) {
      return;
    }
    const libraryImage = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true
    });
    if (!libraryImage.uri) {
      return;
    }
    setModalVisible(false);
    updateGroupImage(username, group._id, group.name, libraryImage.uri);
  };

  const deletePhotoHandler = () => {
    if (group.avatar) {
      deleteGroupImage(group._id);
    }
    setModalVisible(false);
  };

  return (
    <ScreenModal visible={props.visible} animationType="slide">
      <Modal
        style={{ alignItems: "center", justifyContent: "center" }}
        isVisible={modalVisible}
        onBackdropPress={modalCloseHandler}
        animationIn="zoomIn"
        animationOut="zoomOut"
        animationInTiming={200}
        backdropTransitionOutTiming={0}
      >
        <View style={styles.overlayContainer}>
          <TouchableOpacity
            style={styles.overlayItemWrapper}
            onPress={takePhotoHandler}
          >
            <View style={styles.overlayItem}>
              <View style={styles.iconWrapper}>
                <MaterialIcons color="white" name="camera-alt" size={24} />
              </View>
              <BodyText style={styles.overlayText}>Take Photo</BodyText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.overlayItemWrapper}
            onPress={choosePhotoHandler}
          >
            <View style={styles.overlayItem}>
              <View style={styles.iconWrapper}>
                <Ionicons color="white" name="md-images" size={24} />
              </View>
              <BodyText style={styles.overlayText}>Choose Photo</BodyText>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.overlayItemWrapper}
            onPress={deletePhotoHandler}
          >
            <View style={styles.overlayItem}>
              <View style={styles.deleteIconWrapper}>
                <AntDesign color="white" name="delete" size={24} />
              </View>
              <BodyText style={styles.overlayDelete}>Delete Photo</BodyText>
            </View>
          </TouchableOpacity>
          <View style={styles.cancel}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <BodyText style={styles.cancelText}>Cancel</BodyText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          {isLoading && <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>}
          <View style={styles.header}>
            <HeadingText style={styles.heading}>Group Info</HeadingText>
              <TouchableOpacity style={styles.closeModalContainer} onPress={() => {
                props.closeModal();
              }}>
                <MaterialIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity activeOpacity={1}>
            <View>
              <View>
                {group.avatar ?
                  <Image 
                    placeholderStyle={styles.placeholder}
                    source={{ uri: group.avatar.imagePath }}
                    resizeMode={'cover'}
                    style={styles.image} /> : 
                  <Image source={require('../../assets/avatar2.png')} style={styles.image} />
                }
              </View>   
              <View style={styles.cameraIconContainer}>
                <TouchableOpacity onPress={avatarEditHandler}>
                  <MaterialIcons style={styles.cameraIcon} name="camera-alt" size={30} />
                </TouchableOpacity>
              </View>
            </View>
        <View style={styles.nameContainer}>
          <TextInput 
            value={name} 
            editable={editName}
            onChangeText={text => setName(text)}
            ref={(input) => { nameInput = input; }}
            style={styles.nameInput} />
          <TouchableOpacity onPress={editNameHandler}>
            <MaterialCommunityIcons name="square-edit-outline" size={28} color='#202020' />
          </TouchableOpacity>
        </View>
        <BodyText style={{ fontSize: 16, marginLeft: 15, marginTop: 8, marginBottom: 5, color: Colors.primary }}>Creator</BodyText> 
        <View style={styles.participant}>
          <Image
            style={{ width: 48, height: 48, borderRadius: 24, marginBottom: 2 }}
            source={require("../../assets/avatar2.png")} />
          <BodyText>{group.owner}</BodyText>
        </View>
        <BodyText style={{ fontSize: 16, marginLeft: 15, marginTop: 8, marginBottom: 5, color: Colors.primary }}>Members</BodyText>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 15}}>
            {group.participants && group.participants.map((item, index) => (
              <View key={index} style={styles.participant}>
                <Image
                  style={{ width: 48, height: 48, borderRadius: 24, marginBottom: 2 }}
                  source={require("../../assets/avatar2.png")} />
                <BodyText>{item.user.username}</BodyText>
              </View>
            ))}      
        </View>
        <TouchableOpacity onPress={() => {
          setIsLoading(true);
          leaveGroup(group._id, userId).then(res => {
            getChats({username}).then(res => {
              setIsLoading(false);
            });
          });
        }}>
          <HeadingText style={{ color: Colors.tertiary, fontSize: 18, marginTop: 5, marginBottom: 20, textAlign: 'center' }}>Leave Group</HeadingText>
        </TouchableOpacity>
        </TouchableOpacity>
        {Platform.OS === 'ios' && <KeyboardAvoidingView behaviour="padding" />} 
       </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </ScreenModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 14,
    paddingBottom: 8,
    paddingTop: 24,
    backgroundColor: Colors.primary
  },
  nameInput: {
    fontSize: 18,
    color: '#202020',
    height: '100%',
    width: '85%',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#DCDCDC'
  },
  participant: {
    alignItems: 'center',
    width: 50,
    marginLeft: 15
  },
  heading: {
    color: '#fff',
    fontSize: 20
  },
  closeModalContainer: {
    position: 'absolute',
    right: 10,
    top: 24
  },
  placeholder: {
    backgroundColor: 'white'
  },
  image: {
    width: Dimensions.get('window').width,
    height: 250
  },
  cameraIconContainer: {
    backgroundColor: 'lightgrey',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    position: 'absolute',
    top: '72%',
    right: 11,
    padding: 5
  },
  overlayContainer: {
    width: 230,
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 4
  },
  overlayItemWrapper: {
    marginBottom: 10
  },
  overlayItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    borderBottomColor: "lightgrey",
    borderBottomWidth: 1
  },
  overlayText: {
    fontSize: 18,
    marginLeft: 8,
    color: "grey"
  },
  overlayDelete: {
    fontSize: 18,
    marginLeft: 8,
    color: Colors.tertiary
  },
  iconWrapper: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  deleteIconWrapper: {
    backgroundColor: Colors.tertiary,
    borderRadius: 100,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  cancel: {
    marginTop: 10,
    padding: 5,
    alignSelf: "center"
  },
  cancelText: {
    color: "grey",
    fontSize: 18
  },
  spinnerContainer: {
    position: 'absolute',
    top: 290,
    left: Dimensions.get('window').width / 2 - 10,
    zIndex: 2
  }
});

export default GroupSettingsScreen;
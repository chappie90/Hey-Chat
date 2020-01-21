import React, { useState, useContext, useEffect } from 'react';
import { View, TouchableWithoutFeedback, Text, StyleSheet, Alert } from 'react-native';
import { Image } from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { MaterialIcons } from '@expo/vector-icons';

import Colors from '../constants/colors';
import PrimaryButton from './PrimaryButton';
import BodyText from './BodyText';
import { Context as AuthContext } from '../context/AuthContext';

const ImgPicker = props => {
  const {state: { username, profileImage }, saveImage, getImage} = useContext(AuthContext);

  useEffect(() => {
    getImage(username);
  }, []);

  const getPermissions = async () => {
    // for access to galary CAMERA_ROLL
    const result = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
    if (result.status !== 'granted') {
      Alert.alert('You don\'t have required permissions', [{text: 'Okay'}]);
      return false;
    }

    return true;
  };

  const imageSelected = async () => {
    const hasPermission = await getPermissions();
    if (!hasPermission) {
      return;
    } 
    // we get the image when the promise resolves
    const image = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      // aspect: [16, 9]
      // quality: 0.5 // between 0 and 1

    });

    if (!image.uri) {
      return;
    }

    saveImage(username, image.uri);
  };

  return (
    <View style={styles.imagePickerContainer}>
      <TouchableWithoutFeedback onPress={imageSelected}>
        <View style={styles.profileContainer}>
          <View style={styles.imagePreview}>
            {profileImage ?
              <Image resizeMode="stretch" source={{ uri: profileImage}} style={styles.image} /> : 
              <Image source={require('../../assets/avatar2.png')} style={styles.image} />
            }
          </View>
          <View style={styles.cameraIconContainer}>
            <MaterialIcons style={styles.cameraIcon} name="camera-alt" size={36} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  imagePickerContainer: {
    alignItems: 'center'
  },
  profileContainer: {
    marginTop: 30
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginBottom: 30,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'white',
    overflow: 'hidden'
  },
  image: {
    width: 200,
    height: 200,
  },
  cameraIconContainer: {
    backgroundColor: 'lightgrey',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    position: 'absolute',
    top: '65%',
    right: 15,
    padding: 5
  }
});

export default ImgPicker;
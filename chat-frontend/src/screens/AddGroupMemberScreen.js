import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator
} from "react-native";
import { MaterialIcons, Ionicons, AntDesign } from "@expo/vector-icons";
import Modal from "react-native-modal";
import Colors from "../constants/colors";
import { Context as AuthContext } from "../context/AuthContext";
import { Context as ContactsContext } from "../context/ContactsContext";
import { Context as ProfileContext } from "../context/ProfileContext";
import { Context as ChatContext } from "../context/ChatContext";
import ScaleImageAnim from "../components/animations/ScaleImageAnim";
import TranslateFadeViewAnim from "../components/animations/TranslateFadeViewAnim";
import TranslateViewAnim from "../components/animations/TranslateViewAnim";
import ScaleViewAnim from "../components/animations/ScaleViewAnim";
import HeadingText from "../components/HeadingText";
import BodyText from "../components/BodyText";

const AddGroupScreen = props => {
  const { state: { contacts }, getContacts } = useContext(ContactsContext);
  const { state: { username } } = useContext(AuthContext);
  const { createGroup, getChats } = useContext(ChatContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [search, setSearch] = useState("");
  const [addToGroupArr, setAddToGroupArr] = useState([]);
  const [expandHeader, setExpandHeader] = useState(false);
  const [groupContacts, setGroupContacts] = useState([]);
  const [disableCreateBtn, setDisableCreateBtn] = useState(true);
  const socket = useRef(null);

  useEffect(() => {
    getContacts({ username });
  }, []);

  useEffect(() => {
    if (addToGroupArr.length === 0) {
      setExpandHeader(false);
    }
  }, [addToGroupArr]);

  useEffect(() => {
    setGroupContacts(contacts);
  }, [contacts]);

  const createGroupHandler = (username, groupName, groupImage, groupMembers) => {
    createGroup({ username, groupName, groupImage, groupMembers });
    setAddToGroupArr([]);
    setGroupContacts(contacts);
    setDisableCreateBtn(true);
    setSearch("");
    props.closeModal();
  };

  const updateGroupHandler = contactName => {
    if (addToGroupArr.includes(contactName)) {
      setAddToGroupArr(prevState =>
        addToGroupArr.filter(contact => contact !== contactName)
      );
    } else {
      setAddToGroupArr(prevState => addToGroupArr.concat(contactName));
    }
  };

  const modalCloseHandler = () => {
    setModalVisible(false);
  };

  return (
    <Modal
      isVisible={props.visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onSwipeComplete={() => props.closeModal()}
      swipeThreshold={60}
      swipeDirection="down"
      backdropOpacity={0}
      onBackdropPress={() => Keyboard.dismiss()}
      propagateSwipe={true}
      style={{ margin: 0}}
    >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity
                onPress={() => {
                  setAddToGroupArr([]);
                  setGroupContacts(contacts);
                  setDisableCreateBtn(true);
                  setSearch("");
                  props.closeModal();
                }}
              >
                <MaterialIcons name="close" size={28} color="white" />
              </TouchableOpacity>    
              <HeadingText style={styles.heading}>Add Participants</HeadingText>
              <TouchableOpacity disabled={disableCreateBtn} onPress={() => {
                createGroupHandler(username, groupName, imagePreview, addToGroupArr);
              }}>
                <Ionicons
                  color={disableCreateBtn ? "#C0C0C0" : "#fff"}
                  name="ios-add-circle-outline"
                  size={34}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{ marginVertical: 8 }}
              onPress={() => {}}
            >
              <View
                style={{
                  height: 32,
                  borderRadius: 4,
                  marginHorizontal: 5,
                  paddingHorizontal: 8,
                  backgroundColor: "#F0F0F0",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center"
                }}
              >
                <MaterialIcons color="#909090" name="search" size={28} />
                <TextInput
                  style={styles.searchInput}
                  selectionColor={"#909090"}
                  placeholder="Search"
                  placeholderTextColor="#909090"
                  value={search}
                  onChangeText={contact => {
                    setSearch(contact);
                    if (!contact) {
                      setGroupContacts(contacts);
                      return;
                    }
                    setGroupContacts(prevState =>
                      contacts.filter(c => c.user.username.includes(contact))
                    );
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </TouchableOpacity>
          </View>
          <TranslateViewAnim
            triggerAnim={expandHeader}
            style={{
              backgroundColor: Colors.tertiary,
              height: 80,
              paddingBottom: 10,
              paddingHorizontal: 15
            }}
          >
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              {addToGroupArr.map(item => {
                const contact = contacts.find(
                  contact => contact && contact.user.username === item
                );
                return contact.user.profile ? (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      setAddToGroupArr(prevState =>
                        addToGroupArr.filter(contact => contact !== item)
                      );
                    }}
                  >
                    <ScaleViewAnim
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 15,
                        marginTop: 10
                      }}
                    >
                      <View
                        style={{
                          position: "absolute",
                          top: -3,
                          right: -3,
                          zIndex: 1,
                          backgroundColor: "#fff",
                          borderRadius: 20
                        }}
                      >
                        <MaterialIcons
                          name="close"
                          size={18}
                          color="indianred"
                        />
                      </View>
                      <Image
                        style={{ width: 48, height: 48, borderRadius: 24 }}
                        source={{ uri: contact.user.profile.imgPath }}
                      />
                      <Text style={{ marginTop: 4, color: "#fff" }} key={item}>
                        {item}
                      </Text>
                    </ScaleViewAnim>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      setAddToGroupArr(prevState =>
                        addToGroupArr.filter(contact => contact !== item)
                      );
                    }}>
                    <ScaleViewAnim
                      key={item}
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 15,
                        marginTop: 10
                      }}>
                      <View
                        style={{
                          position: "absolute",
                          top: -3,
                          right: -3,
                          zIndex: 1,
                          backgroundColor: "#fff",
                          borderRadius: 20
                        }}>
                        <MaterialIcons name="close" size={18} color="indianred" />
                      </View>
                      <Image
                        style={{ width: 48, height: 48, borderRadius: 24 }}
                        source={require("../../assets/avatar2.png")}
                      />
                      <Text style={{ marginTop: 4, color: "#fff" }} key={item}>
                        {item}
                      </Text>
                    </ScaleViewAnim>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TranslateViewAnim>
          <View style={{ flex: 1 }}>
            {contacts.length > 0 ? (
              <FlatList
                data={groupContacts}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableWithoutFeedback
                      style={{ borderRadius: 5, overflow: "hidden" }}
                      onPress={() => {
                        setExpandHeader(true);
                        updateGroupHandler(item.user.username);
                        setGroupContacts(contacts);
                        setSearch("");
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 4,
                          paddingHorizontal: 15
                        }}
                      >
                        <View
                          style={{
                            overflow: "hidden",
                            width: 48,
                            height: 48,
                            borderRadius: 24
                          }}
                        >
                          {item.user.profile ? (
                            <Image
                              style={{ width: 48, height: 48 }}
                              placeholderStyle={styles.placeholder}
                              source={{ uri: item.user.profile.imgPath }}
                            />
                          ) : (
                            <Image
                              style={{ width: 48, height: 48 }}
                              source={require("../../assets/avatar2.png")}
                            />
                          )}
                        </View>
                        <View style={styles.itemContainer}>
                          <HeadingText style={styles.name}>
                            {item.user.username}
                          </HeadingText>
                        </View>
                        {addToGroupArr.includes(item.user.username) ? (
                          <ScaleViewAnim
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 13,
                              backgroundColor: Colors.tertiary,
                              borderWidth: 2,
                              justifyContent: "center",
                              alignItems: "center",
                              borderColor: Colors.tertiary
                            }}
                          >
                            <MaterialIcons
                              name="check"
                              size={20}
                              color="#fff"
                            />
                          </ScaleViewAnim>
                        ) : (
                          <View
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 13,
                              borderWidth: 2,
                              borderColor: Colors.tertiary
                            }}
                          />
                        )}
                      </View>
                    </TouchableWithoutFeedback>
                  );
                }}
              />
            ) : (
              <View style={styles.imageContainer}>
                <ScaleImageAnim
                  style={styles.image}
                  source={require("../../assets/icons_256_contact.png")}
                />
                <TranslateFadeViewAnim>
                  <BodyText style={styles.imageCaption}>
                    Stay in touch with your loved ones
                  </BodyText>
                </TranslateFadeViewAnim>
              </View>
            )}
          </View>
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 90
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: Colors.tertiary,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10
  },
  heading: {
    color: "#fff",
    fontSize: 20,
    flex: 1,
    textAlign: "center"
  },
  headerMiddle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  itemContainer: {
    marginLeft: 15,
    flex: 1
  },
  searchInput: {
    fontSize: 18,
    fontFamily: "open-sans",
    color: "#909090",
    flex: 1,
    height: "100%"
  },
  input: {
    backgroundColor: "indianred",
    color: "#fff",
    paddingHorizontal: 15,
    height: 36,
    borderRadius: 4,
    fontSize: 18,
    fontFamily: "open-sans",
    flex: 1
  },
  image: {
    width: 100,
    height: 100
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80
  },
  imageCaption: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
    color: "#000"
  },
  headerBottom: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
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
  }
});

export default AddGroupScreen;
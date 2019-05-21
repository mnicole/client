import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Alert
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
    Container,
    Header,
    Title,
    Content,
    Form,
    Button,
    Left,
    Right,
    Body,
    Icon,
    Text,
    List,
    ListItem,
    Item,
    Input,
    Toast
} from 'native-base';
import { Icon as MaterialIcon } from 'react-native-elements';

import {
    fetchMessages,
    fetchCreateMessage,
    fetchCreateReaction,
    fetchRemoveUserFromChat
} from '../actions/chats';

import { ChatMessage } from '../components/ChatMessage';
import { EmojiMenu } from '../components/EmojiMenu';

class ChatScreen extends React.Component {
    static navigationOptions = {
        header: null
    };

    state = {
        selectedMessage: null,
        inputText: ''
    };

    componentDidMount() {
        const cid = this.props.navigation.getParam('chatId');
        this.props.fetchMessages(cid);
    }

    componentDidUpdate(prevProps) {
        const { chats, currentChat, currentUser, navigation } = this.props;
        const { display_name: displayName } = currentUser;
        if (prevProps.chats !== chats) {
            Toast.show({
                text: `${displayName}, you have left ${currentChat.name}`,
                buttonText: "Okay",
                type: "success",
                duration: 2000,
                onClose: () => navigation.navigate('Chats')
            });
        }
    }

    // Send message form
    submitForm = () => {
        const { inputText } = this.state;
        const cid = this.props.navigation.getParam('chatId');
        this.props.fetchCreateMessage(cid, inputText);
        this.setState({ 
            inputText: '' 
        });
    };

    confirmLeavingChat = () => {
        const { currentChat, currentUser, navigation, fetchRemoveUserFromChat } = this.props;

        const alertTitle = `Leaving chat ${navigation.getParam('chatName')}`;
        const alertBody = 'Are you sure you want to leave?';
        Alert.alert(
            alertTitle,
            alertBody,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                { 
                    text: 'OK', 
                    onPress: () => fetchRemoveUserFromChat(currentChat.id, currentUser.id) 
                }
            ]
        );
    }

    render() {
        const {
            navigation,
            currentUser,
            messages,
            currentChat
        } = this.props;
        const {
            emojiMenuOpen,
            inputText,
            selectedMessage
        } = this.state;
        return (
            <View style={styles.container}>
                <ScrollView
                    style={styles.chatContainer}
                    contentContainerStyle={styles.contentContainer}>
                    <Container>
                        <Header>
                            <Left>
                                <Button transparent>
                                    <Icon
                                        name="md-arrow-back"
                                        onPress={() =>
                                            navigation.pop()
                                        }
                                    />
                                </Button>
                            </Left>
                            <Body>
                                <Title>
                                    {navigation.getParam('chatName')}
                                </Title>
                            </Body>
                            <Right>
                                <Button 
                                    transparent
                                    onPress={() =>
                                        this.props.navigation.navigate('AddUserToChat', {
                                            chatId: currentChat.id
                                        })
                                    }>
                                    <Icon name="person-add" />
                                </Button>
                                <Button
                                    transparent
                                    onPress={this.confirmLeavingChat}>
                                    <MaterialIcon 
                                        name="logout"
                                        type="material-community"
                                        color="red"
                                        iconStyle={styles.materialIcon} 
                                    />
                                </Button>
                            </Right>
                        </Header>
                        <Content>
                            {messages &&
                                messages.map((message) => {
                                    const mId = message.id;
                                    const _handleLongPress = () => {
                                        this.setState({
                                            selectedMessage: mId
                                        });
                                    };

                                    const handleEmojiClick = (emoji) => {
                                        this.props.fetchCreateReaction(
                                            mId,
                                            emoji
                                        );
                                        this.setState({
                                            selectedMessage: null
                                        });
                                    };

                                    const isOpen = selectedMessage == mId;
                                    const isSelf = currentUser &&
                                        currentUser.id == message.users_id;
                                    const user = currentChat &&
                                        currentChat.users.find(
                                            ({ id }) =>
                                                id == message.users_id
                                        );
                                    const displayName = user && user.display_name;

                                    return (
                                        <TouchableOpacity
                                            key={mId}
                                            onLongPress={
                                                _handleLongPress
                                            }>
                                            <ChatMessage
                                                key={mId}
                                                message={message}
                                                isSelf={isSelf}
                                                displayName={
                                                    displayName
                                                }
                                                users={
                                                    currentChat &&
                                                    currentChat.users
                                                }
                                            />
                                            {isOpen && (
                                                <EmojiMenu
                                                    onClick={
                                                        handleEmojiClick
                                                    }
                                                />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                        </Content>
                    </Container>
                </ScrollView>
                <KeyboardAvoidingView
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0
                    }}
                    behavior="position">
                    <Form style={styles.content}>
                        <Item style={styles.chatInput} regular>
                            <Input
                                placeholder="Type your message here!"
                                value={inputText}
                                onChangeText={(inputText) =>
                                    this.setState({ inputText })
                                }
                            />
                            <Button
                                style={styles.chatButton}
                                onPress={this.submitForm}>
                                <Text>Send</Text>
                            </Button>
                        </Item>
                    </Form>
                </KeyboardAvoidingView>
            </View>
        );
    }
}

function mapStateToProps({
    chatsReducer: { currentChat, chats },
    userReducer: { currentUser },
    messageReducer: { messages }
}) {
    return {
        chats,
        currentChat,
        currentUser,
        messages
    };
}

const mapDispatchToProps = (dispatch) => ({
    fetchMessages: bindActionCreators(fetchMessages, dispatch),
    fetchRemoveUserFromChat: bindActionCreators(fetchRemoveUserFromChat, dispatch),
    fetchCreateReaction: bindActionCreators(fetchCreateReaction, dispatch),
    fetchCreateMessage: bindActionCreators(fetchCreateMessage, dispatch)
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#fff',
        marginBottom: 70
    },
    chatButton: {
        top: 3
    },
    contentContainer: {
        paddingTop: 30
    },
    tabBarInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: { height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 3
            },
            android: {
                elevation: 20
            }
        }),
        alignItems: 'center',
        backgroundColor: '#fbfbfb',
        paddingVertical: 20
    },
    tabBarInfoText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        textAlign: 'center'
    },
    navigationFilename: {
        marginTop: 5
    },
    materialIcon: {
        marginTop: 5
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatScreen);

import React, { Component } from "react";
import { View, Text, Image,Dimensions,AppRegistry, Animated, Easing, TouchableHighlight } from "react-native";
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
let ViewTypes = {
  FULL: 0
};
let deviceWidth = Dimensions.get("window").width;
export default class RNAnimatedHeader extends React.Component {
  constructor(args) {
    super(args);
    this.scrollListener = this.scrollListener.bind(this);
    this.nonSnapHeaderOnScroll = this.nonSnapHeaderOnScroll.bind(this);
    this.snapHeaderOnScroll = this.snapHeaderOnScroll.bind(this);
    this.toggleScrollBehaviour = this.toggleScrollBehaviour.bind(this);
    let dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });
    this.scrollYPosition=0;
    this.totalHeaderOffset = 0;
    this.directionArray = [];
    this.fixedStickyHeight = 50;
    this._layoutProvider = new LayoutProvider(
        index => {
          return ViewTypes.FULL;
        },
        (type, dim) => {
          switch (type) {
            case ViewTypes.FULL:
              dim.width = deviceWidth;
              dim.height = 140;
              break;
            default:
              dim.width = 0;
              dim.height = 0;
          }
        }
    );

    this._rowRenderer = this._rowRenderer.bind(this);
    this.state = {
      dataProvider: dataProvider.cloneWithRows(this._generateArray(300)),
      stickyHeight: new Animated.Value(0),
      isClosed : new Animated.Value(0),
      snapScroll : false
    };
  }

  _generateArray(n) {
    let arr = new Array(n);
    for (let i = 0; i < n; i++) {
      arr[i] = i;
    }
    return arr;
  }

  _rowRenderer(type, data) {
    switch (type) {
      case ViewTypes.FULL:
        return (
            <View style={{flex : 1}}>
              <View style={styles.container}>
                <Text>Data: {data}</Text>
              </View>
              <View style={styles.separator}/>
            </View>
        );
      default:
        return null;
    }
  }

  snapHeaderOnScroll(direction){
    let { stickyHeight } = this.state;
    let { isClosed } = this.state;
    if(direction === "down"){
      if(isClosed._value==0){
        Animated.timing(stickyHeight, {toValue: -this.fixedStickyHeight, duration: 150, easing: Easing.linear, useNativeDriver: true}).start();
        isClosed.setValue(1);
      }
    }
    else{
      if(isClosed._value==1){
        Animated.timing(stickyHeight, {toValue: 0, duration: 150, easing: Easing.linear,useNativeDriver: true}).start();
        isClosed.setValue(0);
      }
    }
  }

  nonSnapHeaderOnScroll(difference){
    let { stickyHeight } = this.state;
    this.totalHeaderOffset = this.totalHeaderOffset + difference;
    this.totalFooterOffset = this.totalFooterOffset + difference;
    if(difference>=0){
      if(this.totalHeaderOffset>=this.fixedStickyHeight){
        this.totalHeaderOffset = this.fixedStickyHeight;
      }
    }
    if(difference<0){
      if(this.totalHeaderOffset<=0){
        this.totalHeaderOffset = 0;
      }
    }
    Animated.timing(stickyHeight, {toValue:-this.totalHeaderOffset, duration:0, easing:Easing.easeOut, useNativeDriver: true}).start();
  }

  scrollListener(event){
    let currentOffset = event.nativeEvent.contentOffset.y;
    if(this.state.snapScroll){
      var direction = currentOffset > this.scrollPosition ? 'down' : 'up';
      this.scrollPosition = currentOffset;
      if(this.directionArray.length<2){
        if(this.directionArray.length ==1){
          this.directionArray[1] = direction;
        }
        if(this.directionArray.length ==0){
          this.directionArray[0] = direction;
        }
      }
      else{
        this.directionArray[0] = this.directionArray[1];
        this.directionArray[1] = direction;
      }
      if(direction === this.directionArray[0] && direction === this.directionArray[1]){
        this.snapHeaderOnScroll(direction);
      }
    } else {
      let isOffsetWithinBounds = currentOffset + event.nativeEvent.layoutMeasurement.height <= event.nativeEvent.contentSize.height;
      if (currentOffset >= 0 && isOffsetWithinBounds) {
        let difference = currentOffset - this.scrollYPosition;
        this.scrollYPosition = currentOffset;
        this.nonSnapHeaderOnScroll(difference);
      }
    }
  }

  toggleScrollBehaviour(){
    this.refs.recyclerListView.scrollToTop();
    let { stickyHeight } = this.state;
    stickyHeight.setValue(0);
    this.setState({
      snapScroll : !this.state.snapScroll
    })
  }

  render() {
    let toggleButtonText = this.state.snapScroll ? "Snap Scrolling Now" : "Non Snap Scrolling Now";
    return(
        <View style={{flex : 1}}>
          <RecyclerListView
              ref = "recyclerListView"
              layoutProvider={this._layoutProvider}
              dataProvider={this.state.dataProvider}
              rowRenderer={this._rowRenderer}
              style={{flex : 1, paddingTop : 100}}
              bounces={false}
              onScroll={this.scrollListener}
          />
          <Animated.View style={{transform: [{translateY: this.state.stickyHeight}],height : 100, width : deviceWidth, backgroundColor : '#2874f0',position : 'absolute', top : 0, left : 0}}>
            <View style={styles.headerBar}>
              <Text style={styles.headerText}>Scroll to Hide Me</Text>
            </View>
            <View style={{height :1, width : deviceWidth,  backgroundColor : '#ffffff'}}/>
            <View style={styles.headerBar}>
              <Text style={styles.headerText}>I'll stick around</Text>
            </View>
          </Animated.View>
          <TouchableHighlight underlayColor={'#2874f0'} onPress={this.toggleScrollBehaviour} style={styles.toggleButton}>
            <View style={styles.buttonView}>
              <Text style={styles.headerText}>{toggleButtonText}</Text>
            </View>
          </TouchableHighlight>
        </View>
    )
  }
}
const styles = {
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#ffffff"
  },
  separator:{
    height : 1,
    width : deviceWidth,
    backgroundColor : '#2874f0'
  },
  headerBar:{
    flex : 1,
    backgroundColor : '#2874f0',
    justifyContent : 'center',
    alignItems : 'center'
  },
  headerText:{
    fontSize : 14,
    color : '#ffffff'
  },
  toggleButton:{
    height : 50,
    width : 80,
    backgroundColor : '#2874f0',
    position : 'absolute',
    top : 120,
    right : 20
  },
  buttonView:{
    flex : 1,
    justifyContent : 'center',
    alignItems : 'center'
  }
};
AppRegistry.registerComponent('RNAnimatedHeader', () => RNAnimatedHeader);

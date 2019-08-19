import React from 'react';
import logo from './logo.svg';
import './App.css';
import { WiredCard } from "wired-card"
import { WiredSpinner } from "wired-spinner"
import { WiredButton } from "wired-button"
import { WiredFab } from "wired-fab"
import { WiredCombo} from "wired-combo"
import { Row, Col } from "antd"
import ReactDOM from 'react-dom'
import ReactRough, { Rectangle, Circle } from 'react-rough';

class App extends React.Component {
  state = {
    loading: true,
    todaySchedule: {},
    invalidTime: false
  };


  serverHost = 'http://129.211.141.226'

  updateUrl = this.serverHost+'/update_schedule'
  getUrl = this.serverHost+'/today_schedule'

  componentWillMount() {
    this.login = false;
    this.try_time = 3;
  }

  load(){
    this.setState({
      loading: true
    })
    fetch(this.getUrl)
    .then((response) => {
      return response.json();
    })
    .then(async (json) => {

      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log(json)
      this.setState({
        todaySchedule: json,
        loading: false
      })
    });
  }

  componentDidMount() {
    this.load();

  }

  

  button(name, available){
    let text = (available === 'false' || available === 'unknown-false')?'没空':'有空'
    const { invalidTime } = this.state
    if(invalidTime){
      return (<wired-button disabled onClick={()=>this.toggleAvailable(name, available)}>{text}</wired-button>)
    } else {
      return (<wired-button onClick={()=>this.toggleAvailable(name, available)}>{text}</wired-button>)
    }
  }

  fab(available){
    let color = 'gray'
    if(available === 'false'){
      color = 'red'
    } else if(available === 'true'){
      color = 'green'
    }

    return (<ReactRough width={32} height={32}>
        <Circle points={[16, 16, 15]} fill={color} fillWeight="4" stroke="transparent" roughness="1"></Circle>
    </ReactRough>)
  }
  toggleAvailable(name, available){
    const {todaySchedule} = this.state
    let currentSchedule = todaySchedule[name]
    let targetAvailable = (available === 'false' || available === 'unknown-false')?'true':'false'

    let timeParams = '&timeBegin=00:00&timeEnd=01:30'
    if(currentSchedule.timeBegin && currentSchedule.timeEnd){
      timeParams = `&timeBegin=${currentSchedule.timeBegin}&timeEnd=${currentSchedule.timeEnd}`
    }
    fetch(`${this.updateUrl}?name=${name}&available=${targetAvailable}${timeParams}`)
    .then((response) => {
      return response.json();
    })
    .then(async (json) => {
      if(json.response == 'invalid time'){
        this.setState({
          invalidTime: true
        })
      } else {
        this.load()
      }
    });

    return (<wired-button onClick={()=>this.toggleAvailable(name, available)}>{targetAvailable}</wired-button>)
  }

  render() {
    const {loading, todaySchedule, invalidTime} = this.state

    let content;
    if(loading){
      content = (<wired-spinner spinning></wired-spinner>)
    } else {
      let scheduleList = []
      for(let name in todaySchedule){
        scheduleList.push({
          name: name,
          available: todaySchedule[name].available,
          timeBegin: todaySchedule[name].timeBegin,
          timeEnd: todaySchedule[name].timeEnd,
          marginBottom: '20px'
        })
      }

      scheduleList[scheduleList.length-1].marginBottom = '0'
      content = scheduleList.map((item) => (
        <Row>
          
          <div style={{width:'100px', float: 'left', lineHeight:'35px'}}>
          {item.name}
          </div>
          <div style={{width:'60px', float: 'left'}}>
            {this.button(item.name, item.available) }
          </div>
          {this.fab(item.available)}
          {/* <wired-combo horizontal selected={item.timeBegin}  onItemClick={()=>console.log(123)}
      style={{"--wired-item-selected-color": "darkred", "--wired-item-selected-bg": "pink"}}>
      <wired-item value="22:00">22:00~</wired-item>
      <wired-item value="22:30">22:30~</wired-item>
      <wired-item value="23:00">23:00~</wired-item>
      <wired-item value="23:30">23:30~</wired-item>
      <wired-item value="00:00">00:00~</wired-item>
      <wired-item value="00:30">00:30~</wired-item>
</wired-combo> */}
          <div style={{width:'60px', height: item.marginBottom}}/>
          
    </Row>)
      )
    }
    const promptContent = invalidTime ? (<div>
      <wired-card elevation="3" style={{width:'220px', padding:'10px'}}>
        22:00~23:59不能修改
      </wired-card>
      </div>) : undefined
    return (
      <div style={{padding:'20px'}}>
        <wired-card elevation="3" style={{width:'200px', height: '104px', padding:'20px'}}>
          {content}
          
        </wired-card>
        {promptContent}
      </div>
    );
  }
}

export default App;

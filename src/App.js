import React from 'react';
import logo from './logo.svg';
import './App.css';
import { WiredCard } from "wired-card"
import { WiredSpinner } from "wired-spinner"
import { WiredButton } from "wired-button"
import { WiredFab } from "wired-fab"
import { Row, Col } from "antd"
import ReactDOM from 'react-dom'

class App extends React.Component {
  state = {
    loading: true,
    todaySchedule: {}
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
      this.setState({
        todaySchedule: json,
        loading: false
      })
      let canvas = ReactDOM.findDOMNode(this.refs.myCanvas);
      let ctx = canvas.getContext('2d');
  
      ctx.fillStyle = 'rgb(200,0,0)';
      ctx.fillRect(10, 10, 55, 50);
      
    });
  }

  componentDidMount() {
    this.load();

  }

  

  button(name, available){
    let text = (available === 'false')?'没空':'有空'
    return (<wired-button onClick={()=>this.toggleAvailable(name, available)}>{text}</wired-button>)
  }

  fab(available){
    if(available === 'false'){
      return (<wired-fab style={{'--wired-fab-bg-color': "red"}}></wired-fab>);
    } else if(available === 'true'){
      return (<wired-fab></wired-fab>);
    } else{
      return (<wired-fab style={{'--wired-fab-bg-color': "gray"}}></wired-fab>);
    }
  }
  toggleAvailable(name, available){
    const {todaySchedule} = this.state
    let currentSchedule = todaySchedule[name]
    let targetAvailable = (available === 'false')?'true':'false'

    let timeParams = '&timeBegin=00:00&timeEnd=01:30'
    if(currentSchedule.timeBegin && currentSchedule.timeEnd){
      timeParams = `&timeBegin=${currentSchedule.timeBegin}&timeEnd=${currentSchedule.timeEnd}`
    }
    fetch(`${this.updateUrl}?name=${name}&available=${targetAvailable}${timeParams}`)
    .then((response) => {
      return response.json();
    })
    .then(async (json) => {

      this.load()
      
    });

    return (<wired-button onClick={()=>this.toggleAvailable(name, available)}>{targetAvailable}</wired-button>)
  }

  render() {
    const {loading, todaySchedule} = this.state

    const { width, height, canvaswidth, canvasheight } = this.props

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
        })
      }
      content = scheduleList.map((item) => (
        <Row>
          
          <div style={{width:'100px', float: 'left', lineHeight:'35px'}}>
          {item.name}
          </div>
          <div style={{width:'60px', float: 'left'}}>
            {this.button(item.name, item.available) }
          </div>
          {this.fab(item.available)}
          <div style={{width:'60px', height: '20px'}}/>
          <canvas ref="myCanvas" />
    </Row>)
      )
    }
    return (
      <div>
        <wired-card elevation="3" style={{width:'220px', height: '124px'}}>
          {content}
          
        </wired-card>
      </div>
    );
  }
}

export default App;

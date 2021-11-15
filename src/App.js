import React, {Component} from 'react'
import { Layout,Modal } from 'antd';
import moment from 'moment';
import Routes from './routes';
//import Aside from './components/Aside';
import https from "./api/https";
import './utils';
import './App.css';
import "./styles/base.css";
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
const { Header, Content } = Layout;

export default class App extends Component {
  state = {
    username: localStorage.getItem("username"),
    orgCode: localStorage.getItem("orgCode"),
    roleName: localStorage.getItem("roleId"),
    date: moment().format('YYYY-MM-DD'),// 当前时间
    collapsed: false,
    visible: false,
    routeList: [],
    menuList: [],
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    this.setState({
      visible: false,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  routerInit(roleId,routeList) {
    let result = [];
    for(let i=0; i<routeList.length; i++){
      let item = routeList[i];
      let role = routeList[i].meta.roleId;
      if(role.includes(roleId)){
        if(item.children && item.children.length){
          result = result.concat(item.children)
        }else{
          result.push(item)
        }
      } 
    }
    return result;
  }

  menuInit(roleId,routeList) {
    let result = [];
    for(let i=0; i<routeList.length; i++){
      let role = routeList[i].meta.roleId;
      if(role.includes(roleId)) result.push(routeList[i])
    }
    return result;
  }
  
  getRoleId = () => {
    https.fetchGet("/roleMenu", {}).then(data => {
      if (data.code === 200) {
        let roleId = data.data.roleId+'';
        //初始化路由
      /*  let routeList = this.routerInit(roleId,AsyncRouterMap);
        let menuList = this.menuInit(roleId,AsyncRouterMap);
        console.log(menuList)
        this.setState({
          routeList,
          menuList
        });*/
      }
    })
  };
  
  componentWillMount() {
    //获取用户角色
    //this.getRoleId();

    //初始化路由
    /*let routeList = this.routerInit('1',AsyncRouterMap);
    routeList = routeList.concat(StaticRouterMap);
    let menuList = this.menuInit('1',AsyncRouterMap);
    this.setState({
      routeList,
      menuList
    });*/
  }

  render() {
    
    return (
      <Layout>
        <Layout>
          <Header className="site-layout-sub-header-background" style={{ padding: 0 }}>
            {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: this.toggle,
            })}
          </Header>
          <Content className="site-layout-background" style={{ margin: 20,padding: 20}}>
            <Routes routeList={this.state.routeList} />
          </Content>
        </Layout>
        <Modal
          title="提示"
          okText="确定"
          cancelText="取消"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <p>确认退出系统？</p>
        </Modal>
      </Layout>
      
    );
  }
}
import { AppProvider, Page, ResourceList, ResourceItem,TextStyle,Link,Stack,Card, Avatar,Icon,SettingToggle} from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import {CirclePlusMinor} from '@shopify/polaris-icons';
import axios from 'axios';
const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';
import Router from 'next/router'
import Cookies from 'js-cookie';
import translations from '@shopify/polaris/locales/en.json';
class Index extends React.Component {
  constructor(props) {
  super(props);
  this.state = { open: false, selectedItems: [], items:[], loading:true, enable: true };
  this.setSelectedItems = this.setSelectedItems.bind(this);
}
componentDidMount(){
  axios.get('/allbars').then(response => {
      this.setState({
        items: response.data,
        loading: false
      })
    })
}
  render() {
    return (
      <Page
        title={'Shipping bar'}
          primaryAction={{
            content: 'Create New Bar',
            onAction: () => this.createnewbar()
          }}
          >
          <Card  sectioned>
          <ResourceList
            resourceName={{singular: 'Shipping bar', plural: 'Shipping bars'}}
            loading={this.state.loading}
            items={this.state.items}
            renderItem={(item)=> {
              const {id, name, intial_msg, goal} = item;
              const media = <Avatar size="medium" name={name} />;
                return (
                  <ResourceItem
                    id={id}
                    media={media}
                    name={name}
                  >
                    <Stack>
                      <Stack.Item fill>
                      <div onClick={(ev) =>this.editbar(id)}>
                        <TextStyle variation="strong">{name}</TextStyle>
                        </div>  
                      </Stack.Item>
                       <Stack.Item>
                        <Icon source={CirclePlusMinor} />
                       </Stack.Item>
                    </Stack>  
                  </ResourceItem>
                );
            }}  
          />
          </Card>
      </Page>
    );
  } 
  handleToggle =(ev)=>{
   // this.setState({enable: });
  }
  setSelectedItems = (ev)=>{
    this.setState({selectedItems: ev});
  }
  createnewbar= () =>{
    this.setState({
        loading: true
      });
    let path = '/createbar';
    Router.push(path);
  }
  editbar = (id) =>{
    this.setState({
        loading: true
      })
    localStorage.setItem('bar_id', id);
    let path = '/editbar';
    Router.push(path);
    // this.props.history.push(path);
  }
}

export default Index;
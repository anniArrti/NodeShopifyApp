import { AppProvider,ContextualSaveBar,Frame, Spinner, Page,Card, Form, FormLayout,TextStyle,Checkbox,
  TextField,Button, Avatar, RangeSlider, DropZone,Stack,Thumbnail, Select} from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import translations from '@shopify/polaris/locales/en.json';
import axios from 'axios';
import Router from 'next/router'
const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';
//import {useHistory } from 'react-router-dom';

class Createbar extends React.Component {
  constructor(props) {
  super(props);
  this.state = { open: false, selectedItems: [], items:[],
  spt_color:'#e21c0d',
  txt_color:'#ffffff',
  bg_color:'#000000',
  opacity:10,
  bg_img:'',
  filename:'',
  name:'',
  goal:'',
  intial_msg:'',
  progress_msg:'',
  achive_msg:'',
  loading : true,
  btnload:false,
  contentsaver: false,
  pagebutton:false,
  padding:'7',
  font_size: '16',
  close_button: 'yes' };
 this.handleSubmit = this.handleSubmit.bind(this);
 this.handlecolorChange = this.handlecolorChange.bind(this);
}
componentDidMount(){

  this.setState({loading: false});
  // axios.get('/allbars').then(response => {
  //   console.log(response);
  //     this.setState({
  //       items: response.data
  //     })
  //   })
}
  render() {
    const {contentsaver,pagebutton,btnload,spt_color,txt_color,bg_color,close_button,font_size,padding,opacity,loading,filename,bg_img,name,goal,intial_msg,progress_msg,achive_msg} = this.state;
    const options = [
    {label: 'Yes', value: 'yes'},
    {label: 'No', value: 'no'},
  ];
    const fileUpload = !this.state.bg_img && <DropZone.FileUpload />;
    const uploadedFile = bg_img && (<Stack><Thumbnail
        size="small"
        alt={filename.name}
        source='https://cdn.shopify.com/s/files/1/0757/9955/files/New_Post.png?12678548500147524304'
        />
        <div>
          {filename.name}
        </div>
      </Stack>);
    return (
      <AppProvider i18n={{Polaris: { Frame: {
          skipToContent: 'Skip to content',
        },
        ContextualSaveBar: {
          save: 'Save',
          discard: 'Discard',
        },
      },
    }}>
      <Frame>
      { contentsaver ? (<ContextualSaveBar 
                message="Unsaved changes"
                saveAction={{
                  onAction: () => this.handleSubmit(),
                  loading: btnload,
                  disabled: false,
                }}
                discardAction={{
                  onAction: () => this.discard(),
                }}
              />): ''}
      <Page title="Create New Bar"
          primaryAction={{
            content: 'Cancel',
            disabled: pagebutton,
            onAction: () => this.createnewbar()
          }}
          >
          {loading ? (<Card><div className="spinner-cls" style={{textAlign: "center", padding: "20px"}}>
                    <Spinner accessibilityLabel="Spinner example" size="large" color="teal"/>
                    </div></Card>):
      (<Form>
        <Card sectioned title="Style Configuration">
          <Card.Section >
          <FormLayout>
            <FormLayout.Group>
            <TextField
            value={bg_color}
            onChange={(ev) =>this.handlecolorChange(ev, 'bg_color')}
            label="Background Color"
            type="color"
          />
          <TextField
            value={txt_color}
            onChange={(ev) =>this.handlecolorChange(ev, 'txt_color')}
            label="Text Color"
            type="color"
          />
          <TextField
            value={spt_color}
            onChange={(ev) =>this.handlecolorChange(ev, 'spt_color')}
            label="Special Text Color"
            type="color"
          />
        </FormLayout.Group>
      </FormLayout>
      <FormLayout>
        <FormLayout.Group>
          <TextField
            value={font_size}
            onChange={(ev) =>this.handlecolorChange(ev, 'font_size')}
            label="Font Size"
            type="text"
          />
          <TextField
            value={padding}
            onChange={(ev) =>this.handlecolorChange(ev, 'padding')}
            label="Padding"
            type="text"
          />
        </FormLayout.Group>
      </FormLayout>
      <FormLayout>
      <RangeSlider
        label="Background Color Opacity"
        value={opacity}
        onChange={(ev) =>this.handlecolorChange(ev, 'opacity')}
        min={0}
        max={10}
        output
        helpText={
              <span>
                The range is from 0 to 1,0 = transparent and 1 = solid
               </span>
            }
      />
      <DropZone onDrop={this.handleDropZoneDrop}>
      {uploadedFile}
      {fileUpload}
      </DropZone>
      </FormLayout>
      </Card.Section>
      </Card>
      <Card title="Content Configuration">
        <Card.Section >
          <FormLayout>
            <TextField
            value={name}
            onChange={(ev) =>this.handlecolorChange(ev, 'name')}
            label="Name"
            type="text"
          />
          <TextField
            value={goal}
            onChange={(ev) =>this.handlecolorChange(ev, 'goal')}
            label="Free Shipping Goal"
            type="text"
          />
          <TextField
            value={intial_msg}
            onChange={(ev) =>this.handlecolorChange(ev, 'intial_msg')}
            label="Initial Message"
            type="text"
          />
          <TextField
            value={progress_msg}
            onChange={(ev) =>this.handlecolorChange(ev, 'progress_msg')}
            label="Progress Message"
            type="text"
          />
          <TextField
            value={achive_msg}
            onChange={(ev) =>this.handlecolorChange(ev, 'achive_msg')}
            label="Goal Achieved Message"
            type="text"
          />
          <Select
            label="Include The Close Button"
            options={options}
            onChange={this.handleSelectChange}
            value={close_button}
          />
        </FormLayout>
      </Card.Section>
    </Card>
    </Form>)}
    </Page>
    </Frame>
    </AppProvider>
        )
      }
  handlecolorChange = (ev, name) =>{
    this.setState({
    ...this.state,
    [name]: ev,
    contentsaver: true
  });
  }
  handleSelectChange =(ev)=>{
    console.log(ev);
    this.setState({close_button: ev});
  }
  handleSubmit = () =>{
    if(this.state.name == '' || this.state.intial_msg== '' || this.state.goal== ''){
      return false;
    }
    this.setState({ loading : true,btnload:true, pagebutton: true});
    let formData = new FormData();
    formData.append('file', this.state.bg_img);
    formData.append('name', this.state.name);
    formData.append('goal', this.state.goal);
    formData.append('intial_msg', this.state.intial_msg);
    formData.append('progress_msg', this.state.progress_msg);
    formData.append('opacity', this.state.opacity);
    formData.append('achive_msg', this.state.achive_msg);
    formData.append('spt_color', this.state.spt_color);
    formData.append('bg_color', this.state.bg_color);
    formData.append('txt_color', this.state.txt_color);
    formData.append('padding', this.state.padding);
    formData.append('font_size', this.state.font_size);
    formData.append('close_button', this.state.close_button);
    
    var that = this;
    axios.post('/createbar', formData,
             {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
             })
             .then(function (response) {
              Router.push('/');
              //that.setState({ loading : false});
              //router.push('/');
             });
  }
  handleDropZoneDrop= (ev) =>{
    this.setState({ filename : ev[0]});
    this.createImage(ev[0]);
  }
  createImage(file) {
    let reader = new FileReader();
    reader.onload = (e) => {
      this.setState({
        bg_img: e.target.result
      })
    };
    reader.readAsDataURL(file);  
  }
  createnewbar= () =>{
    this.setState({
        loading: true
      });
    let path = '/';
    Router.push(path);
  }
  discard= () =>{
    this.setState({ contentsaver: false });
  }
  }
export default Createbar;
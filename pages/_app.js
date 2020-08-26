import App from 'next/app';
import Head from 'next/head';
import { AppProvider ,Page} from '@shopify/polaris';
import { Provider } from '@shopify/app-bridge-react';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';
import Cookies from 'js-cookie';

class MyApp extends App {
//  state = { origin: false, config:{}}
  render() {
    const { Component, pageProps } = this.props;
    const config = { apiKey: API_KEY, shopOrigin: Cookies.get("shopOrigin"), forceRedirect: true };
   
    // if(Cookies.get("shopOrigin")){
    //   this.setState({ origin: true })
    //    }else{
    //   this.setState({ origin: false })
    // }
    
    return (
      <React.Fragment>
        <Head>
          <title>Sample App</title>
          <meta charSet="utf-8" />
        </Head>
        <Provider config={config}>
          <AppProvider i18n={translations}>
          <Component {...pageProps} />
          </AppProvider>
          </Provider> 
      </React.Fragment>
    );
  }
}

export default MyApp;
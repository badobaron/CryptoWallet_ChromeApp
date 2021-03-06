import * as React from 'react'
import { Redirect, Route } from 'react-router';
import * as CCID from '../hardware/CCID'
import MainWindow from './components/MainWindow'
import Header from './components/Header'
import Footer  from './components/Footer';
import Bitcoin from '../crypto/Bitcoin'
import { getBitcoinSmartBitBalance, initBitcoinAddress, setBTCBalance, setBTCPrice, getBitcoinLastTx, getBTCBalance, } from '../crypto/Bitcoin'
import { initEthereumAddress, setETHBalance, setETHPrice, getEthereumLastTx, getEthereumAddress, getETHBalance } from '../crypto/Ethereum'
import { getLitecoinAddress, getLitecoinLastTx, getLTCBalance, initLitecoinAddress, setLTCBalance, setLTCPrice } from '../crypto/Litecoin'
import SidebarNoButtons from './components/SidebarNoButtons'
import SidebarContent from './components/SidebarContent'
import MainContent from './components/MainContent'
import BTCWindow from './components/BTCWindow'
import ETHWIndow from './components/ETHWindow'
import getCurrencyRate from '../core/getCurrencyRate'
import { getStatus, getAddress, updateHWStatus } from '../hardware/DeviceAPI'
import { connectToRipple } from '../crypto/Ripple'
import RippleWindow from '../ui/components/RippleWindow'
import CurrencyWindow from '../ui/components/CurrencyWindow'

interface IAppState {
    BTCBalance: number,
    ETHBalance: number,
    LTCBalance: number,
    XRPBalance: number,
    BTCPrice: number,
    ETHPrice: number,
    LTCPrice: number,
    XRPPrice: number,
    totalBalance: number,
    BTCHourChange: number,
    ETHHourChange: number,
    LTCHourChange: number,
    XRPHourChange: number,
    BTCLastTx: Array<any>,
    LTCLastTx: Array<any>,
    ETHLastTx: Array<any>,
    XRPLastTx: Array<any>,
    connection: boolean,
    status: boolean,
    redirect: boolean,
    tempState: Array<any>,
    allowInit: boolean,
    redirectToTransactionSuccess: boolean,
    totalPercentage: number,
    isInitialized: boolean,
    walletStatus: number,
    redirectToMain: boolean
  }

export default class App extends React.Component<any, IAppState> {
    routes = [
        {
          path: '/main',
          exact: true,
          sidebar: () => <SidebarContent total = {this.state.totalBalance} refresh = {this.updateData} totalPercent = {this.state.totalPercentage}/>,
          main: () => <MainContent btcBalance = {this.state.BTCBalance} ltcBalance = {this.state.LTCBalance} ethBalance = {this.state.ETHBalance}
          btcPrice = {this.state.BTCPrice} ltcPrice = {this.state.LTCPrice} ethPrice = {this.state.ETHPrice} btcHourChange = {this.state.BTCHourChange}
          ltcHourChange = {this.state.LTCHourChange} ethHourChange = {this.state.ETHHourChange} lastTx = {this.state.BTCLastTx.concat(this.state.ETHLastTx, this.state.LTCLastTx).sort((a: any, b: any) => {
            let c = new Date(a.Date).getTime()
            let d = new Date(b.Date).getTime()
            return d - c
          })} transactions = {this.getTransactions}/>
        },
        {
          path: '/btc-window',
          exact: true,
          sidebar: () => <SidebarNoButtons total = {this.state.totalBalance} totalPercent = {this.state.totalPercentage}/>,
          main: () => <CurrencyWindow name = 'BTC' balance = {this.state.BTCBalance} price = {this.state.BTCPrice} hourChange = {this.state.BTCHourChange} lastTx = {this.state.BTCLastTx.sort((a: any, b: any) => {
            let c = new Date(a.Date).getTime()
            let d = new Date(b.Date).getTime()
            return d - c
          })}  redirect = {this.redirectToTransactionsuccess}/>
        },
        {
          path: '/eth-window',
          exact: true,
          sidebar: () => <SidebarNoButtons total = {this.state.totalBalance} totalPercent = {this.state.totalPercentage}/>,
          main: () => <CurrencyWindow name = 'ETH' balance = {this.state.ETHBalance} price = {this.state.ETHPrice} hourChange = {this.state.ETHHourChange} lastTx = {this.state.ETHLastTx.sort((a: any, b: any) => {
            let c = new Date(a.Date).getTime()
            let d = new Date(b.Date).getTime()
            return d - c
          })}  redirect = {this.redirectToTransactionsuccess}/>
        },
        {
          path: '/ltc-window',
          exact: true,
          sidebar: () => <SidebarNoButtons total = {this.state.totalBalance} totalPercent = {this.state.totalPercentage}/>,
          main: () => <CurrencyWindow name = 'LTC' balance = {this.state.LTCBalance} price = {this.state.LTCPrice} hourChange = {this.state.LTCHourChange} lastTx = {this.state.LTCLastTx.sort((a: any, b: any) => {
            let c = new Date(a.Date).getTime()
            let d = new Date(b.Date).getTime()
            return d - c
          })}  redirect = {this.redirectToTransactionsuccess}/>
        },
        {
          path: '/ripple-window',
          exact: true,
          sidebar: () => <SidebarNoButtons total = {this.state.totalBalance} totalPercent = {this.state.totalPercentage}/>,
          main: () => <CurrencyWindow name = 'XRP' balance = {this.state.BTCBalance} price = {this.state.BTCPrice} hourChange = {this.state.BTCHourChange} lastTx = {this.state.BTCLastTx.sort((a: any, b: any) => {
            let c = new Date(a.Date).getTime()
            let d = new Date(b.Date).getTime()
            return d - c
          })}  redirect = {this.redirectToTransactionsuccess}/>
        }
      ]
    constructor(props: any) {
        super(props)
        this.state = {
            BTCBalance: 0,
            ETHBalance: 0,
            LTCBalance: 0,
            XRPBalance: 0,
            BTCPrice: 0,
            ETHPrice: 0,
            LTCPrice: 0,
            XRPPrice: 0,
            totalBalance: 0,
            BTCHourChange: 0,
            LTCHourChange: 0,
            ETHHourChange: 0,
            XRPHourChange: 0,
            LTCLastTx: [],
            BTCLastTx: [],
            ETHLastTx: [],
            XRPLastTx: [],
            connection: false,
            status: false,
            redirect: false,
            tempState: [],
            allowInit: true,
            redirectToTransactionSuccess: false,
            totalPercentage: 0,
            isInitialized: false,
            walletStatus: 3,
            redirectToMain: false
          }
        this.getPermissions = this.getPermissions.bind(this)
        this.getTransactions = this.getTransactions.bind(this)
        this.redirectToTransactionsuccess = this.redirectToTransactionsuccess.bind(this)
        this.resetRedirect = this.resetRedirect.bind(this)
        this.updateData = this.updateData.bind(this)
        this.getWalletInfo = this.getWalletInfo.bind(this)
        this.openConnection = this.openConnection.bind(this)
        this.getRates = this.getRates.bind(this)
        this.getBalances = this.getBalances.bind(this)
        this.setValues = this.setValues.bind(this)
        this.changeBalance = this.changeBalance.bind(this)
        this.parseBTCLikeTransactions = this.parseBTCLikeTransactions.bind(this)
        this.parseETHTransactions = this.parseETHTransactions.bind(this)
        this.parseTransactionDataBTC = this.parseTransactionDataBTC.bind(this)
        this.parseTransactionDataETH = this.parseTransactionDataETH.bind(this)
    }

    getPermissions() {
        CCID.findDevice()
    }

    redirectToTransactionsuccess() {
        let self = this
        self.resetRedirect()
        self.setState({ redirectToTransactionSuccess: true })
    }
    resetRedirect() {
        this.setState({ redirectToTransactionSuccess: false })
    }
    connectionOK() {
        this.setState({ connection: true })
    }
    connectionERROR() {
        this.setState({ connection: false })
    }
    setRedirectToMain() {
        this.setState({ redirectToMain: true })
    }
    getWalletInfo() {
        let interval = setInterval(async () => {
          try {
            let data = await getStatus()
            console.log('RESOLVED STATUS', data)
            switch (data) {
            case 0: {
              clearInterval(interval)
              this.initAll()
              this.setState({ walletStatus: 0 })
              break
            }
            case 1: {
              this.setState({ walletStatus: 1 })
              break
            }
            case 2: {
              this.setState({ walletStatus: 2 })
              break
            }
            case 3: {
              this.setState({ walletStatus: 3 })
              break
            }
            case 4: {
              this.setState({ walletStatus: 4 })
              break
            }
            }
          } catch (error) {
            clearInterval(interval)
          }
        },500,[])
    }
    initAll() {
        if (this.state.allowInit) {
          this.setState({ allowInit: false })
          initBitcoinAddress().then(initEthereumAddress).then(initLitecoinAddress).then(this.getBalances).then(this.getRates).then(this.getTransactions).then(() => updateHWStatus(this.state.BTCBalance, this.state.BTCPrice, this.state.ETHBalance, this.state.ETHPrice, this.state.LTCBalance, this.state.LTCPrice)).then(() => {
            this.setRedirectToMain()
            this.setValues()
          })
          /*initBitcoinAddress()
          .then(() => initEthereumAddress()).then(() => initLitecoinAddress()).then(() => this.setState({ status: true }))
          .then(() => this.getValues()).then(() => this.getTransactions())
          .then(() => UpdateHWStatusPCSC(this.state.BTCBalance, this.state.BTCPrice, this.state.ETHBalance, this.state.ETHPrice, this.state.LTCBalance, this.state.LTCPrice))
          */
        }
    }

    componentWillMount() {
        this.setState({ redirect: true })
    }
    async componentDidMount() {
 
      chrome.usb.onDeviceRemoved.addListener((device) => {
        if (device.productId === 279 && device.vendorId === 8137) {
          this.setState({ connection: false })
  
          CCID.closeDevice()
        }
        console.log('REMOVED DEVICE', device)
      })
      chrome.usb.onDeviceAdded.addListener((device) => {
        if (device.productId === 279 && device.vendorId === 8137) {
          this.setState({ connection: true })
          this.openConnection().then( () => this.getWalletInfo())
        }
        console.log('Added device', device)
      })
      let res = await CCID.findDevice()
      if (res > 0) {
        this.openConnection().then(() => this.getWalletInfo())
        this.setState({ connection: true })
      }
    }
    async openConnection() {
      let resp = await CCID.findDevice()
      let open = await CCID.openDevice()
      let inter = await CCID.listInterfaces()
      let intrf = await CCID.claimInterface()
      let conf = await CCID.getConfiguration()
    }
    setValues() {
        setBTCBalance(this.state.BTCBalance)
        setBTCPrice(this.state.BTCPrice)
        setETHBalance(this.state.ETHBalance)
        setETHPrice(this.state.ETHPrice)
        setLTCBalance(this.state.LTCBalance)
        setLTCPrice(this.state.LTCPrice)
      }
      updateData() {
        this.getTransactions().then(this.getBalances)
        .then(() => {
          updateHWStatus(this.state.BTCBalance, this.state.BTCPrice, this.state.ETHBalance, this.state.ETHPrice, this.state.LTCBalance, this.state.LTCPrice)
        }).then(this.getRates)
      }
      changeBalance(currency: string, amount: number) {
        switch (currency) {
        case 'BTC': {
          this.setState({ BTCBalance: (this.state.BTCBalance - amount) })
          break
        }
        case 'ETH': {
          this.setState({ ETHBalance: (this.state.ETHBalance - amount) })
          break
        }
        case 'LTC': {
          this.setState({ LTCBalance: (this.state.LTCBalance - amount) })
        }
      }
    }
    addUnconfirmedTx(currency: string, amount: number, address: string, hash: string) {
        let currentDate = new Date()
        let tx = {
          Date: currentDate.getFullYear() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getDate() + ' ' + currentDate.getHours() + ':' + currentDate.getMinutes(),
          Currency: currency,
          Amount: amount,
          Address: address,
          Status: 'Unconfirmed',
          Type: 'outgoing',
          Hash: hash
        }
        switch (currency) {
        case 'BTC' : {
          this.setState({ BTCLastTx: [...this.state.BTCLastTx, tx] })
          break
        }
        case 'ETH': {
          this.setState({ ETHLastTx: [...this.state.ETHLastTx, tx] })
          break
        }
        case 'LTC': {
          this.setState({ LTCLastTx: [...this.state.LTCLastTx, tx] })
          break
        }
        }
    }
    
    getRates() {
        return new Promise((resolve) => {
          getCurrencyRate().then(value => {
            const parsedValue = JSON.parse(value.content)
            for (let item in parsedValue) {
              switch (parsedValue[item].id) {
              case 'bitcoin': {
                console.log('THIS',this)
                this.setState({ BTCPrice: Number((parsedValue[item].price_usd * this.state.BTCBalance).toFixed(2)),
                  BTCHourChange: Number(parsedValue[item].percent_change_1h)})
                break
              }
              case 'ethereum': {
                this.setState({ ETHPrice: Number((parsedValue[item].price_usd * this.state.ETHBalance).toFixed(2)),
                  ETHHourChange: Number(parsedValue[item].percent_change_1h)})
                break
              }
              case 'litecoin': {
                this.setState({ LTCPrice: Number((parsedValue[item].price_usd * this.state.LTCBalance).toFixed(2)),
                  LTCHourChange: Number(parsedValue[item].percent_change_1h)})
                break
              }
              }
            }
            let total = this.state.BTCPrice + this.state.ETHPrice + this.state.LTCPrice

            this.setState({ totalBalance: Number((total).toFixed(8)) })
            let totalPercentage = this.state.BTCHourChange + this.state.ETHHourChange + this.state.LTCHourChange
            this.setState({ totalPercentage: Number((totalPercentage).toFixed(2)) })
            resolve()
          })
        })
    }
    getBalances() {
        return Promise.all([getBTCBalance(),getETHBalance(), getLTCBalance()]).then(value => {
          console.log('GOT THIS VALUE', value)
          for (let item in value) {
            switch (value[item][0]) {
            case 'BTC': {
              this.setState({ BTCBalance:  value[item][1] })
              break
            }
            case 'ETH': {
              this.setState({ ETHBalance: value[item][1] })
              break
            }
            case 'LTC': {
              this.setState({ LTCBalance: value[item][1] })
              break
            }
            }
          }
        })
    }
    getTransactions() {
        return Promise.all([getBitcoinLastTx(),getLitecoinLastTx(), getEthereumLastTx()]).then(value => {

          for (let index in value) {
            if (Object.prototype.hasOwnProperty.call(JSON.parse(value[index].content),'data')) {
              this.parseBTCLikeTransactions(value[index].content)
            } else {
              this.parseETHTransactions(value[index].content)
            }
          }
        }).catch(error => {
        })
    }
      parseETHTransactions(value: any) {
        let transactionsObject = JSON.parse(value)
        if (transactionsObject === undefined) {
          return
        }
        transactionsObject.map((value: any) => {
          let parsedTx = this.parseTransactionDataETH(value, getEthereumAddress())
          let findResp = this.state.ETHLastTx.find(function (obj) {
            return obj.Hash === Object(parsedTx).Hash
          })
          if (findResp === undefined) {
            this.setState({ ETHLastTx: [...this.state.ETHLastTx, parsedTx] })
          } else if (Object(parsedTx).Status !== findResp.Status) {
            for (let index in this.state.ETHLastTx) {
              if (this.state.ETHLastTx[index].Hash === Object(parsedTx).Hash) this.state.ETHLastTx[index].Status = Object(parsedTx).Status
            }
          }
        })
    
    }
    
    parseBTCLikeTransactions(value: any) {
        let parsedResponse = JSON.parse(value).data
        for (let tx in parsedResponse.txs) {
          switch (parsedResponse.network) {
          case 'BTC': {
            let parsedTx = this.parseTransactionDataBTC(parsedResponse.txs[tx], 'BTC')
            let findResp = this.state.BTCLastTx.find(function (obj) {
              return obj.Hash === Object(parsedTx).Hash
            })
            if (findResp === undefined) {
              this.setState({ BTCLastTx: [...this.state.BTCLastTx, parsedTx] })
            } else if (Object(parsedTx).Status !== findResp.Status) {
              for (let index in this.state.BTCLastTx) {
                if (this.state.BTCLastTx[index].Hash === Object(parsedTx).Hash) this.state.BTCLastTx[index].Status = Object(parsedTx).Status
              }
            }
            break
          }
          case 'LTC': {
            let parsedTx = this.parseTransactionDataBTC(parsedResponse.txs[tx], 'LTC')
            let findResp = this.state.LTCLastTx.find(function (obj) {
              return obj.Hash === Object(parsedTx).Hash
            })
            if (findResp === undefined) {
              this.setState({ LTCLastTx: [...this.state.LTCLastTx, parsedTx] })
            } else if (Object(parsedTx).Status !== findResp.Status) {
              for (let index in this.state.LTCLastTx) {
                if (this.state.LTCLastTx[index].Hash === Object(parsedTx).Hash) this.state.LTCLastTx[index].Status = Object(parsedTx).Status
              }
            }
            break
          }
          }
        }
    }

      parseTransactionDataETH(transaction: any, ethAddress: string) {
        let date = new Date(transaction.timestamp * 1000)
        let dateCell = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
        let amount = transaction.value
        let type = ''
        let hash = transaction.hash
        { (transaction.from === ethAddress.toLowerCase()) ? (type = 'outgoing') : (type = 'incoming') }
        let address = ''
        { (type === 'outgoing') ? (address = transaction.to) : (address = transaction.from) }
        let status = transaction.success ? 'Confirmed' : 'Unconfirmed'
        let returnedObject = {
          Date: dateCell,
          Currency: 'ETH',
          Amount: amount,
          Address: address,
          Status: status,
          Type: type,
          Hash: hash
        }
        return returnedObject
    
    }
      
    parseTransactionDataBTC(transaction: any, currency: string): Object {
        let returnedObject = {}
        if (transaction.outgoing !== undefined) {
          let date = new Date(transaction.time * 1000)
          let dateCell = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
          let amount = transaction.outgoing.outputs[0].value
          let address = transaction.outgoing.outputs[0].address
          let type = 'outgoing'
          let status = (transaction.confirmations === 0) ? 'Uncofirmed' : 'Confirmed'
          let hash = transaction.txid
          let dataToPass = {
            Date: dateCell,
            Currency: currency,
            Amount: amount,
            Address: address,
            Status: status,
            Type: type,
            Hash: hash
          }
          returnedObject = dataToPass
        } else {
          let date = new Date(transaction.time * 1000)
          let dateCell = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()
          let amount = transaction.incoming.value
          let address = transaction.incoming.inputs[0].address
          let type = 'incoming'
          let status = (transaction.confirmations === 0) ? 'Uncofirmed' : 'Confirmed'
          let hash = transaction.txid
          let dataToPass = {
            Date: dateCell,
            Currency: currency,
            Amount: amount,
            Address: address,
            Status: status,
            Type: type,
            Hash: hash
          }
          returnedObject = dataToPass
        }
        return returnedObject
    }

    render() {
        return(
            <div className = 'container'>
                <Header/>
                {(this.state.redirect) ? (
                    <Redirect to = '/start'/>
                ): (
                     null
                )}
                {this.routes.map((route, index) => (
                <Route
                    exact = {route.exact}
                    key = {index}
                    path={route.path}
                    component= {route.sidebar}
                />
                ))}
                {this.routes.map((route, index) => (
                <Route
                    key = {index}
                    exact = {route.exact}
                    path={route.path}
                    component= {route.main}
                />
                ))}
                <Route path = '/start' component = {() => <MainWindow walletStatus = {this.state.walletStatus} connection = {this.state.connection} redirectToMain = {this.state.redirectToMain}/>}/>
                <Footer connection = {this.state.connection}/>
            </div>
        )
    }
}

import * as React from 'react'
import CreateQR from '../../core/CreateQR'
import { getBitcoinAddress } from '../../crypto/Bitcoin' 
import  Table  from '../primitive/Table'
import { sendTransaction } from '../../core/SendTransaction'
import { BITCOIN_PATH } from '../../core/paths'
interface IBTCWindowState {
  address: string,
  qrcodeAddress: string,
  paymentAddress: string,
  amount: number,
  fee: number
}

export default class BTCWindow extends React.Component<any, IBTCWindowState> {
  constructor(props: any) {
    super(props)

    this.handleCopyClick = this.handleCopyClick.bind(this)
    this.handleAddressChange = this.handleAddressChange.bind(this)
    this.handleAmountChange = this.handleAmountChange.bind(this)
    this.handleFeeChange = this.handleFeeChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.state = {
      address: getBitcoinAddress(),
      qrcodeAddress: '',
      paymentAddress: '',
      amount: 0,
      fee: 0
    }
  }
  componentWillMount() {
    this.setState({ qrcodeAddress: CreateQR(this.state.address) })
    // this.props.transactions()
    console.log('PROPERTY: ' + this.props.lastTx)
  }
  handleCopyClick() {
    // clipboard.writeText(this.state.address)
  }
  handleClick() {
    sendTransaction('bitcoin', this.state.paymentAddress, this.state.amount, this.state.fee, this.props.redirect)
  }
  handleAmountChange(e: any) {
    this.setState({ amount: e.target.value })
  }
  handleAddressChange(e: any) {
    this.setState({ paymentAddress: e.target.value })
  }
  handleFeeChange(e: any) {
    this.setState({ fee: e.target.value })
  }
  render () {
    console.log('PROPS IN BTCWINDOW', this.props.balance)
    return (
      <div className = 'main'>
        <div className = 'main-content'>
          <div className = 'currency-content'>
            <div className = 'currency-block-container'>
              <div className = 'currency-block-card'>
                <p className = 'default-font-colored'>Your Bitcoin</p>
                <div className = 'card-container-second-block'>
                <div className = 'card-upper-block'>
                  <img src = {BITCOIN_PATH}/>
                  <p className = 'currency-name'> Bitcoin</p>
                </div>
                <hr/>
                <div className = 'card-bottom-block'>
                <div className = 'card-bottom-crypto-text'>
                    <p className = 'currency-amount-crypto text-inline'>{this.props.balance}</p>
                    <p className = 'currency-short-name text-inline'>BTC</p>
                    </div>
                    <div className = 'wrap'>
                      {(this.props.hourChange > 0) ? (
                        <p className = 'positive-percentage text-inline'>{this.props.hourChange}%</p>
                      ) : (
                        <p className = 'negative-percentage text-inline'>{this.props.hourChange}%</p>
                      )}
                    <p className = 'currency-amount-fiat text-inline'>{this.props.price}$</p>
                    </div>
                </div>
              </div>
              </div>
              <div className = 'currency-block-transaction'>
              <header className = 'default-font-colored'>Send Bitcoin</header>
                <input type = 'text' className = 'payment_address' placeholder = 'Payment Address' value = {this.state.paymentAddress} onChange = {this.handleAddressChange}/>
                <input type = 'text' className = 'payment_address' placeholder = 'Amount' onChange = {this.handleAmountChange} value = {this.state.amount}/>
                <button type = 'submit' className = 'button-send' onClick = {this.handleClick}>Send</button>
              </div>
            </div>
            </div>
            <div className = 'currency-address-container'>
              <div className = 'currency-address'>
                <p className = 'default-font-colored'>Your Bitcoin Address:</p>
                <img src = {this.state.qrcodeAddress} className = 'address-qrcode'/>
                <div className = 'address-with-button'>
                  <p className = 'address-with-button-address'>{this.state.address}</p>
                  <button type = 'submit' className = 'button-copy' onClick = {this.handleCopyClick}>Copy</button>
                </div>
              </div>
            </div>
            <Table data = {this.props.lastTx} type = 'small'/>
          </div>
      </div>
    )
  }
}
import React, {useEffect,useState} from 'react';
import axios from 'axios';
import { EnhancedTable } from './EnhancedTable';
import SearchIcon from '../images/search.png';


const Orders  = (props) =>{

    let [isLoading,setIsLoading] = useState(true);
    let records = [];
    const [tableTitle,setTableTitle] = useState('Orders');
    const [orders,setOrders] = useState(records);
    const [amount,setAmount] = useState(0);
    const [startDate,setStartDate]= useState('2020-01-01');
    const [endDate,setEndDate] = useState('2020-01-01');
    const months = ["Jan","Feb","March","April","May","June","July","August","September","October","November","December"];

    //Function to convert date and time
    const convertDateTime  = (rdate)=>{
              rdate = rdate.toString();
            //   console.log(rdate);
              let date = new Date(rdate);
              let order_date='';
              let month = months[date.getMonth()];
              order_date=month+" ";
              let dt = date.getDate()-1;
              if(dt=='1'){
                 order_date += dt+'st';
              }
              else if(dt=='2'){
                order_date += dt+'nd';
             }
             else if(dt=='3'){
                order_date += dt+'rd';
             }else{
                order_date += dt+'th';
             }

             var hours = date.getHours();
             var minutes = date.getMinutes();
             var ampm = hours >= 12 ? 'pm' : 'am';
             hours = hours % 12;
             hours = hours ? hours : 12; 
             minutes = minutes < 10 ? '0'+minutes : minutes;
             var strTime = hours + ':' + minutes + ' ' + ampm;

             order_date += ","+strTime;

             return order_date;
    }

    //Function to strucuture the response based on the responses received
    const generateResponse = (data) =>{
      let responseArray = data;
      let amount = 0;
      let arrayTemp=[];

      for(let i=0;i<responseArray.length;i++){
          let date = convertDateTime(responseArray[i].order_date);
           responseArray[i].order_date = date;
        
          if(responseArray[i].total_amount == '-'){
            amount = amount+0;
          }else{
          amount = amount+responseArray[i].total_amount;
          }

          amount = Math.round((amount + Number.EPSILON) * 100) / 100;


          responseArray[i].total_amount= "$ "+ responseArray[i].total_amount;
          
          arrayTemp.push(responseArray[i]);
        
      }

      setOrders(arrayTemp);
      setAmount(amount);
      setIsLoading(false);


    }

    //Function called from search 
    const searchOrders = () =>{
          var searchKey = document.getElementById('searchKey').value;
          axios.post("http://localhost:5000/api/searchOrders",{searchKey:searchKey})
          .then((res)=>{
            let responseArray = res.data.msg;
            generateResponse(responseArray);
          });
     }


    //Function called from date picker to filter orders
    const filterOrders = () =>{
        // var startDate = document.getElementById('startDate').value;
        // var endDate = document.getElementById('endDate').value;
        // document.getElementById('startDate').defaultValue= '2020-01-10';
        // document.getElementById('endDate').defaultValue = '2020-01-15';
        
        var startDate = document.getElementById('startDate').value;
        var endDate = document.getElementById('endDate').value;

        setStartDate(startDate);
        setEndDate(endDate);

        console.log(startDate);
        console.log(endDate);
        axios.post("http://localhost:5000/api/filterOrders",{startDate,endDate})
        .then((res)=>{
            let responseArray = res.data.msg;
            generateResponse(responseArray);
          });      
       }


    //USe Efffect to call and fetch the results
    useEffect(()=>{
        axios.get("http://localhost:5000/api/getOrders")
        .then((res)=>{
            console.log(res.data.msg);
            let responseArray = res.data.msg;
            generateResponse(responseArray);
        });
      },[]);
    

    return(<div>
        <h1 style={{'textAlign':'center'}}>Order Management System</h1>
        <div className="search">
            <span>
               <img src={SearchIcon} width="40px" height="40px" alt="Search" style={{'verticalAlign':'middle'}}></img>
                <span style={{'margin':'0px','fontSize':'36px','verticalAlign':'middle','fontWeight':'bolder'}}>Search</span>
            </span>

            
            <input type='text' id="searchKey" onKeyUp={searchOrders} style={{'fontSize':'20px','verticalAlign':'middle','width':'70%','marginLeft':'10px'}}/>
        </div>

        <div className="createdDate">
           <h4 style={{'marginLeft':'10px'}}>Created date</h4>
           
           <div style={{'marginLeft':'10px'}}>
            <span>Start Date</span>
            <input type='date' id="startDate" value={startDate} onChange={filterOrders}/>
            <span>- End Date</span>
            <input type='date' id="endDate" value={endDate} onChange={filterOrders}/>
           </div>
        </div>
        <br>
        </br>

        <span style={{'marginLeft':'10px'}}>Total Amount: <span style={{'fontWeight':'bolder'}}>$ {amount}</span></span>

        <br/><br/>
        <EnhancedTable data={orders} title={tableTitle}></EnhancedTable>
  
        </div>
    )

};

export default Orders;
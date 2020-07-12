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
    const [startDate,setStartDate]= useState('');
    const [endDate,setEndDate] = useState('');
    const months = ["Jan","Feb","March","April","May","June","July","August","September","October","November","December"];

    const convertDateTime  = (rdate)=>{
              let date = new Date(rdate);
              let order_date='';
              let month = months[date.getMonth()];
              order_date=month+" ";
              let dt = date.getDate();
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

    const searchOrders = () =>{
          var searchKey = document.getElementById('searchKey').value;
          axios.post("http://localhost:5000/api/searchOrders",{searchKey:searchKey})
          .then((res)=>{
              console.log(res.data.msg);
              let responseArray = res.data.msg;
              let arrayTemp=[];
              let amount = 0;
        
              for(let i=0;i<responseArray.length;i++){
                arrayTemp.push(responseArray[i]);
                amount = amount+responseArray[i].total_amount;
                let date = convertDateTime(responseArray[i].order_date);
                responseArray[i].order_date = date;
                responseArray[i].delivered_amount= "$ "+ responseArray[i].delivered_amount;
                responseArray[i].total_amount= "$ "+ responseArray[i].total_amount;
              }
        
              setOrders(arrayTemp);
              setAmount(amount);
              // setBattleResults(res.data);
              setIsLoading(false);
        
          });
          
    }

    const filterOrders = () =>{
        var startDate = document.getElementById('startDate').value;
        var endDate = document.getElementById('endDate').value;
        setStartDate(document.getElementById('startDate').value);
        setEndDate(document.getElementById('endDate').value)

        console.log(startDate);
        console.log(endDate);
        axios.post("http://localhost:5000/api/filterOrders",{startDate,endDate})
        .then((res)=>{
            console.log(res.data.msg);
            let responseArray = res.data.msg;
            let arrayTemp=[];
            let amount = 0;
      
            for(let i=0;i<responseArray.length;i++){
              arrayTemp.push(responseArray[i]);
              amount = amount+responseArray[i].total_amount;
              let date = convertDateTime(responseArray[i].order_date);
              responseArray[i].order_date = date;
              responseArray[i].delivered_amount= "$ "+ responseArray[i].delivered_amount;
              responseArray[i].total_amount= "$ "+ responseArray[i].total_amount;
         }
      
            setOrders(arrayTemp);
            setAmount(amount);
            // setBattleResults(res.data);
            setIsLoading(false);
      
        });
    }


    useEffect(()=>{
        axios.get("http://localhost:5000/api/getOrders")
        .then((res)=>{
            console.log(res.data.msg);
            let responseArray = res.data.msg;
            let amount = 0;
            let arrayTemp=[];
      
            for(let i=0;i<responseArray.length;i++){
              arrayTemp.push(responseArray[i]);
              amount = amount+responseArray[i].total_amount;
              let date = convertDateTime(responseArray[i].order_date);
              responseArray[i].order_date = date;
              responseArray[i].delivered_amount= "$ "+ responseArray[i].delivered_amount;
              responseArray[i].total_amount= "$ "+ responseArray[i].total_amount;
            }
      
            setOrders(arrayTemp);
            setAmount(amount);
            // setBattleResults(res.data);
            setIsLoading(false);
      
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
            <input type='date' id="startDate" onSelect={filterOrders}/>
            <span>- End Date</span>
            <input type='date' id="endDate" onSelect={filterOrders}/>
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
import React,{ useState,useEffect } from "react";
import './App.css';
import {
  Card,  CardHeader, Col, Container,
  FormGroup,
  Input,
   Row
} from "reactstrap";
import { MDBInputGroup, MDBInput, MDBIcon, MDBBtn, MDBPaginationLink, MDBPaginationItem, MDBPagination } from 'mdb-react-ui-kit';
import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import { useQuery } from "react-query";
import axios from "./services/Axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Spinner } from "reactstrap"
function App() {
  const [searchvalue, setsearchvalue] = useState("");
  const [sort,setsort]=useState(0);
  const [page,setpage]=useState(1);
  const [data, setdata] = useState([]);
  const [search, setsearch] = useState(false);
  const [pagerow,setPagerow]=useState(5)
  const [pagecount,setpagecount]=useState(0);
  const [pdf,setpdf]=useState(false);
  const [pdfdata,setpdfdata]=useState([]);
  const [isloadingstate2, setisloadingstate2] = useState(false);
  const { isLoading: isLoadingdata, refetch: getAlldata } = useQuery(
    "query-products",
    async () => {
      return await axios.get(`/api/v1/csvdata?search=${searchvalue}&sort=${sort}&page=${page}`);
    },
    {
      enabled: false,
      onSuccess: (res) => {
        const result = {
          status: res.status + "-" + res.statusText,
          headers: res.headers,
          data: res.data,
        };
        setdata(result?.data?.data)
        setpagecount(Math.ceil((result?.data?.count)/10))
      },
      onError: (err) => {
        setdata([])
      },
    }
  );
  const { refetch: getpdfdata } = useQuery(
    "query-products2",
    async () => {
      return await axios.get("/api/v1/csvdata?type=pdf");
    },
    {
      enabled: false,
      onSuccess: (res) => {
        const result = {
          status: res.status + "-" + res.statusText,
          headers: res.headers,
          data: res.data,
        };
        setpdfdata(result?.data?.data)
        setisloadingstate2(false)
      },
      onError: (err) => {
        setpdfdata([])
      },
    }
  );
  useEffect(() => {
    getAlldata()
    return ()=>{
      setsearch(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort,search,page]);
  useEffect(() => {
    if(pdf)
    getpdfdata()
    return ()=>{
      setpdf(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdf]);
  useEffect(() => {
    if(pdfdata?.length >0){
     exportPDF()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfdata]);
  const handleChange=(e)=>{
   setsort(e.target.value)
   setpage(1)
  }
  const handleClick=(e)=>{
    setsearch(true)
    setpage(1)
  }
  const handlePage=(value)=>{
    setpage(value)
  }
  const handlepdf=()=>{
    setpdf(true);
    setpdfdata([])
    setisloadingstate2(true)
  }
  const exportPDF = () => {
    const unit = "pt";
    const size = "A4"; // Use A1, A2, A3 or A4
    const orientation = "portrait"; // portrait or landscape

    const marginLeft = 40;
    const doc = new jsPDF(orientation, unit, size);

    doc.setFontSize(15);

    const title = "Wallet Transactions Report";
    const headers = [["Txhash", "Address", "Amount", "DateTime"]];

    const data = pdfdata.map((elt) => [
      elt.Txhash,
      elt.Address,
      elt.Amount,
      elt.DateTime
    ]);

    let content = {
      startY: 50,
      head: headers,
      body: data
    };

    doc.text(title, marginLeft, 30);
    doc.autoTable(content);
    doc.save("report.pdf");
  };
  return (
    <div className="App">
      <Container className="mt-7  d-flex flex-column" fluid>
        <Row className="mx-24 h-60 align-items-center">
        <Col className="border text-dark fs-1">
      Wallet Transaction List
    </Col> 
        </Row>
        <Row className="flex-grow-1">
        <div className="col">
        <Card >
        <CardHeader className="border-0">
         <Row>
         <Col  xs="6">
                  <FormGroup>
          <Input type="select" 
          name="select" id="exampleSelect" 
          value={sort}
          onChange={handleChange}
          className="w-50 ms-4">
            <option value="0">Descending Order</option>
            <option value="1">Ascending Order</option>
          </Input>
        </FormGroup>
                  </Col>
                  <Col  xs="6">
                  
    <MDBInputGroup className="justify-content-end ">
      <MDBInput 
      value={searchvalue}
      label='Search with wallet address' 
      onChange={(e)=>setsearchvalue(e.target.value)}
      />
      <MDBBtn rippleColor='dark' className="dark" onClick={handleClick}>
        <MDBIcon icon='search' className="size-2"/>
      </MDBBtn>
    </MDBInputGroup>
                  
                  </Col>
         </Row>
         
               
              </CardHeader>
               
              <MDBTable>
      <MDBTableHead dark>
        <tr>
          <th scope='col'>Txhash</th>
          <th scope='col'>Address</th>
          <th scope='col'>Amount</th>
          <th scope='col'>DateTime</th>
        </tr>
      </MDBTableHead>
      <MDBTableBody>
          {isLoadingdata?  
          <tr>
            <td colSpan={4}>
            <Spinner type="grow" color="#332d2d"
           children={false} /> 
            </td>
          </tr>
         
          :data?.length ===0 ?
          <tr>
            <td colSpan={4}>No data Found</td>
          </tr>
          :data.map((item,i)=>(
            <tr key={i}>
            <td>{item?.Txhash}</td>
            <td>{item?.Address}</td>
            <td>{item?.Amount}</td>
            <td>{item?.DateTime}</td>
          
            
            </tr>
          ))}
      </MDBTableBody>
    </MDBTable>
        </Card>
       
        </div>
        
        </Row>
        <Row className="mt-5 mb-5">
          <Col xs="6" className="d-flex" >
            {isloadingstate2 ?
            
            <i className="fas fa-download ms-5 size color-change"  >
              {console.log("Hello")}
            </i>
            :<i className="fas fa-download ms-5 size" onClick={handlepdf} ></i>
          }
          
          
          </Col>
          <Col xs="6" className="d-flex justify-content-end">
            {pagecount >1 && 
            <MDBPagination circle className='me-5'>
              {pagerow>5 && 
               <MDBPaginationItem>
               <MDBPaginationLink  aria-label='Previous' onClick={()=>setPagerow((prev)=>prev-5)}>
                   <span aria-hidden='true'>«</span>
                 </MDBPaginationLink>
               </MDBPaginationItem>
              
              }
       
        {pagecount >=(pagerow -4) && 
          <MDBPaginationItem active={page===(pagerow-4)} onClick={()=>handlePage(pagerow-4)}>
          <MDBPaginationLink >
          {pagerow -4}
          {page ===(pagerow-4) && 
          <span className='visually-hidden'>(current)</span>
         }
          </MDBPaginationLink>
        </MDBPaginationItem>
        }
      
        {pagecount >=(pagerow -3) && 
         <MDBPaginationItem active={page===(pagerow-3)} onClick={()=>handlePage(pagerow-3)}>
         <MDBPaginationLink >
         {pagerow -3} 
         {page ===(pagerow-3) && 
          <span className='visually-hidden'>(current)</span>
         }
        
         </MDBPaginationLink>
       </MDBPaginationItem>
        }
       
        {pagecount >=(pagerow -2) && 
        <MDBPaginationItem active={page===(pagerow-2)} onClick={()=>handlePage(pagerow-2)}>
          <MDBPaginationLink >
            {pagerow -2}
            {page ===(pagerow-2) && 
          <span className='visually-hidden'>(current)</span>
         }
            </MDBPaginationLink>
        </MDBPaginationItem>}
        
        {pagecount >=(pagerow -1) && 
         <MDBPaginationItem active={page===(pagerow-1)}onClick={()=>handlePage(pagerow-1)}>
         <MDBPaginationLink >
           {pagerow -1}
           {page ===(pagerow-1) && 
          <span className='visually-hidden'>(current)</span>
         }
         </MDBPaginationLink>
       </MDBPaginationItem>
        
        }
       
        {pagecount>=pagerow && 
         <MDBPaginationItem active={page===pagerow} onClick={()=>handlePage(pagerow)}>
         <MDBPaginationLink >
           {pagerow}
           {page ===pagerow && 
          <span className='visually-hidden'>(current)</span>
         }
         </MDBPaginationLink>
       </MDBPaginationItem>
        }
       
        {pagecount>pagerow &&
          <MDBPaginationLink  aria-label='Next' onClick={()=>setPagerow((prev)=>prev+5)}>
          <span aria-hidden='true'>»</span>
        </MDBPaginationLink>
        }
       
      </MDBPagination>
      }
          
          </Col>
        </Row>
       
    
      </Container>
    
    </div>
  );
}

export default App;

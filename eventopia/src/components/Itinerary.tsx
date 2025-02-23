import React from 'react';
import styled from 'styled-components';

// Define the type for your component's props
interface ItineraryProps {
    index: number,
    title: string;
    location: string;
    cost: string;
}

const Itinerary: React.FC<ItineraryProps> = ({ index, title, location, cost }) => {
    return (
        <SingleItinerary>
            <Numbering><span>{index + 1}</span></Numbering>
            <ItineraryTitle>{title}</ItineraryTitle>
            <p style={{margin: '0px 15px'}}><span style={{ fontWeight: 'bold' }}>* Location: </span>{location}</p>
            <p style={{margin: '0px 15px'}}><span style={{ fontWeight: 'bold' }}>* Cost: </span>{cost}</p>
        </SingleItinerary>
    );
};

export default Itinerary;

const SingleItinerary = styled.div`
  margin: 20px 10px 0px 10px;
  width: 330px;
  border: 2px solid #CCCCCC;
  border-radius: 20px;
  position: relative;
`

const ItineraryTitle = styled.div`
  font-size: 20px;
  margin: 20px 15px 15px 15px;
  display: inline-block;
  font-weight: bold;
`;

const Numbering = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #AA0BFF;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  position: absolute;
  left: -10px;
  top: -10px;
  font-weight: bold;
`;

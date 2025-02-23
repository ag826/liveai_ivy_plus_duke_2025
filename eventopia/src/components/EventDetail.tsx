import React from 'react';
import styled from 'styled-components';

import CancelButton from '../assets/cancel-button.svg'

// Define the type for your component's props
interface EventDetailProps {
    img: string,
    title: string;
    description: string;
    time: string;
    location: string;
    cost: string;
}

const EventDetail: React.FC<EventDetailProps> = ({ img, title, description, time, location, cost }) => {
    return (
        <EventDetailSection>
            <UserButton style={{ top: 3, left: 3 }}>
                <img src={CancelButton} alt="cancel button" style={{ height: '40px', width: '40px' }} />
            </UserButton>
            <img src={img} alt="event image" style={{
                height: '250px',
                width: '100%',  // Maintain aspect ratio
                objectFit: 'cover',  // Crop or stretch the image to fill the container
            }}
            />

            <div style={{ height: '350px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <Frame style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <DetailTitle>{title}</DetailTitle>
                    <DetailDescription>{description}</DetailDescription>

                    <ul style={{ fontSize: '15px', alignSelf: 'flex-start' }}>
                        <li><span style={{ fontWeight: 'bold' }}>Time: </span>{time}</li>
                        <li><span style={{ fontWeight: 'bold' }}>Location: </span>{location}</li>
                        <li><span style={{ fontWeight: 'bold' }}>Cost: </span>{cost}</li>
                    </ul>
                </Frame>

                <DarkModeButton style={{ alignSelf: 'center' }}>
                    <span>Add to Itinerary</span>
                </DarkModeButton>
            </div>
        </EventDetailSection>
    );
};

export default EventDetail;

const EventDetailSection = styled.div`
  position: absolute;
  background: #ffffff;
  color: black;
  top: 100px;
  right: 550px;
  width: 400px;
  height: 600px;
  border-radius: 15px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
`;

const UserButton = styled.div`
  cursor: pointer;
  position: absolute;
  z-index: 5;
  border-radius: 50%;
`;


const DetailTitle = styled.span`
  font-size: 20px;
  margin: 5px 0px 0px 0px;
  display: inline-block;
  font-weight: bold;
`

const DetailDescription = styled.span`
  font-size: 15px;
  margin: 20px 20px 0px 20px;
  display: inline-block;
  text-align: justify;
`
const Frame = styled.div`
  position: relative;
  top: 10px;
  left: 10px;
  width: calc(100% - 44px);
  height: calc(100% - 44px);
  padding: 10px;
  border: 2px dotted grey;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  overflow-y: auto;
`;

const DarkModeButton = styled.div`
  border-radius: 20px;
  border: 2px solid #AA0BFF;
  padding: 10px;
  font-size: 16px;
  margin: 10px 0px 10px 0px;
  color: white;
  background-color: #AA0BFF;
  width: fit-content;
`
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

type HomeButtonProps = {
    label: string,
    path: string,
};

const StyledContainer = styled.div`
    background-color: Navy;
    display: inline-block;
    margin: 5px;
    padding: 10px 0px;
    width: 120px;
    text-align: center;
`;

const StyledLink = styled(Link)`
    color: red;
    text-decoration: none;
    font-weight: 500;
`;

const PageLink = ({ label = '', path ='/' }: HomeButtonProps) => (
    <StyledContainer>
        <StyledLink to={path}>
            {label.toUpperCase()}
        </StyledLink>
    </StyledContainer>
);

export default PageLink;
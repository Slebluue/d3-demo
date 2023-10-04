import styled from 'styled-components'

const Container = styled.div`
  padding: 32px;
  background-color: #f6f8fa;
  height: calc(100vh - 64px);
`

const Card = styled.div`
  width: ${({ width }) => width};
  height: ${({ height }) => height};

  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: rgb(224, 227, 233) 0px 1px 2px 0px;
  margin: 16px 0;
  padding: 0 0 32px;
`

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: rgb(39, 46, 57);
  margin-top: 0px;
`

const SubTitle = styled.p`
  font-size: 16px;
  font-weight: 400;
  color: rgb(93, 97, 103);
  margin: 8px 0;
`

const Flex = styled.div`
  display: flex;
  margin-top: 32px;

  @media screen and (max-width: 900px) {
    flex-direction: column;
  }
`

const Filter = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 16px;
  margin-bottom: 8px;

  & input {
    border-radius: 4px;
    padding: 4px 8px;
    border: 1px solid rgb(132,144,168);
    font-size: 12px;
  }
`

const Button = styled.button`
  border-radius: 4px;
  background-color: rgb(9,122,230);
  color: rgb(255,255,255);
  transition: background-color 300ms;
  border: 0px;
  padding: 6px 32px;
  font-size: 12px;
  align-self: flex-end;
  margin-bottom: 8px;
  width: 120px;
  text-align: center;

  @media screen and (max-width: 900px) {
    align-self: flex-start;
  }

  &:hover {
    cursor: pointer;
    background-color: rgb(7,91,171);
  }
`


const SmallText = styled.span `
  font-size: 14px;
  font-weight: 400;
  color: rgb(93, 97, 103);
  margin-bottom: 4px;
`

const Tooltip = styled.div`
  width: 200px;
  position: absolute;
  left: 16px;
  top: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 2;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: rgb(224, 227, 233) 0px 1px 2px 0px;
  padding: 16px;
  border-left: 4px solid rgb(9,122,230);

  ${Flex} {
    justify-content: space-between;
    align-items: flex-start;
    margin: 0;
    width: 100%;
  }

  ${SubTitle} {
    margin: 0;
    color: rgb(39, 46, 57);
  }
`


export {
  Container,
  Card,
  Tooltip,
  Title,
  SubTitle,
  SmallText,
  Flex,
  Filter,
  Button
}
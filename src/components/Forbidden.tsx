import React from 'react'
import { motion } from 'framer-motion';
// material
import { styled } from '@mui/material/styles';
import { Box,  Typography, Container } from '@mui/material';
// components
import { MotionContainer, varBounceIn } from '@comp/animate';
import Page from '@comp/Header';

const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10)
}));

const ForbiddenComp=()=>{
  
  return (
    <Page title="403 Forbidden">
      <RootStyle>
        <Container>
          <MotionContainer open>
            <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
              <motion.div variants={varBounceIn}>
                <Typography variant="h3" paragraph>
                  Forbidden!
                </Typography>
              </motion.div>
              <Typography sx={{ color: 'text.secondary' }}>
                Sorry, Your outlet is being accessed from another browser. You can only access dashboard pages from one browser. Please close other browsers, then refresh this page.
              </Typography>

              <motion.div variants={varBounceIn}>
                <Box
                  component="img"
                  src="/static/illustrations/warning.svg"
                  sx={{ height: 260, mx: 'auto', my: { xs: 5, sm: 10 } }}
                />
              </motion.div>
            </Box>
          </MotionContainer>
        </Container>
      </RootStyle>
    </Page>
  );
}

export default ForbiddenComp;
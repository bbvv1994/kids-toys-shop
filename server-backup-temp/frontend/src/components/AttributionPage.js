import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  Divider,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link
} from '@mui/material';
import { 
  ExpandMore, 
  Image, 
  Copyright, 
  PhotoCamera, 
  Attribution,
  Info,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const AttributionPage = () => {
  const { t } = useTranslation();

  const attributionSources = [
    // Новые источники от пользователя
    {
      author: "congerdesign",
      authorLink: "https://pixabay.com/users/congerdesign-509903/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1925425",
      platform: "Pixabay",
      platformLink: "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1925425"
    },
    {
      author: "M W",
      authorLink: "https://pixabay.com/users/efraimstochter-12351/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=86811",
      platform: "Pixabay",
      platformLink: "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=86811"
    },
    {
      author: "freepik",
      authorLink: "https://www.freepik.com/free-photo/kid-playing-with-jigsaw_4250564.htm",
      platform: "Freepik",
      platformLink: "https://www.freepik.com"
    },
    {
      author: "rawpixel",
      authorLink: "https://pixabay.com/users/rawpixel-4283981/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=2985782",
      platform: "Pixabay",
      platformLink: "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=2985782"
    },
    {
      author: "Silke",
      authorLink: "https://pixabay.com/users/a_different_perspective-2135817/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1396863",
      platform: "Pixabay",
      platformLink: "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1396863"
    },
    {
      author: "Esi Grünhagen",
      authorLink: "https://pixabay.com/users/feeloona-694250/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1864718",
      platform: "Pixabay",
      platformLink: "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1864718"
    },
    {
      author: "Stefan Schweihofer",
      authorLink: "https://pixabay.com/users/stux-12364/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=402546",
      platform: "Pixabay",
      platformLink: "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=402546"
    },
    {
      author: "succo",
      authorLink: "https://pixabay.com/users/succo-96729/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=769072",
      platform: "Pixabay",
      platformLink: "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=769072"
    },
    {
      author: "Monoar Rahman Rony",
      authorLink: "https://pixabay.com/users/monoar_cgi_artist-2240009/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1486278",
      platform: "Pixabay",
      platformLink: "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1486278"
    },
    {
      author: "Michal Jarmoluk",
      authorLink: "https://pixabay.com/users/jarmoluk-143740/?utm_source=link-attribution&utm_campaign=image&utm_content=428295",
      platform: "Pixabay",
      platformLink: "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=428295"
    },
    {
      author: "hanseok song",
      authorLink: "https://pixabay.com/users/geegeepia-9144492/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=6590689",
      platform: "Pixabay",
      platformLink: "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=6590689"
    },
    {
      author: "Frantisek Krejci",
      authorLink: "https://pixabay.com/users/frantisek_krejci-810589/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=6286032",
      platform: "Pixabay",
      platformLink: "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=6286032"
    },
    
    // Оригинальные источники из компонента
    {
      author: "Photographer Name",
      authorLink: "https://unsplash.com/@photographer",
      platform: "Unsplash",
      platformLink: "https://unsplash.com"
    },
    {
      author: "rawpixel.com",
      authorLink: "https://ru.freepik.com/free-photo/various-animal-toy-figures-blue-surface_11309811.htm",
      platform: "Freepik",
      platformLink: "https://ru.freepik.com"
    },
    {
      author: "freepik",
      authorLink: "https://ru.freepik.com/free-photo/high-angle-parent-kid-playing_30555959.htm",
      platform: "Freepik",
      platformLink: "https://ru.freepik.com"
    },
    {
      author: "freepik",
      authorLink: "https://ru.freepik.com/free-photo/fluffy-toy-texture-close-up_31897692.htm",
      platform: "Freepik",
      platformLink: "https://ru.freepik.com"
    },
    {
      author: "Mateus Andre",
      authorLink: "https://ru.freepik.com/free-photo/fidget-pop-it-toy-rainbow-color-antistress-fun-educational_18397696.htm",
      platform: "Freepik",
      platformLink: "https://ru.freepik.com"
    },
    {
      author: "freepik",
      authorLink: "https://ru.freepik.com/free-photo/happy-kids-playing-outdoors_30588965.htm",
      platform: "Freepik",
      platformLink: "https://ru.freepik.com"
    },
    {
      author: "freepik",
      authorLink: "https://ru.freepik.com/free-photo/set-toy-medical-equipment_12231609.htm",
      platform: "Freepik",
      platformLink: "https://ru.freepik.com"
    },
    {
      author: "freepik",
      authorLink: "https://ru.freepik.com/free-photo/colorful-decorative-elements-wooden-white-textured-backdrop_3134539.htm",
      platform: "Freepik",
      platformLink: "https://ru.freepik.com"
    },
    {
      author: "freepik",
      authorLink: "https://ru.freepik.com/free-photo/close-up-small-cars-model-road-traffic-conception_6446502.htm",
      platform: "Freepik",
      platformLink: "https://ru.freepik.com"
    },
    {
      author: "Phillip Glickman",
      authorLink: "https://unsplash.com/@phillipglickman?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash",
      platform: "Unsplash",
      platformLink: "https://unsplash.com/photos/green-and-multicolored-robot-figurine-2umO15jsZKM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
    },
    {
      author: "awesomecontent",
      authorLink: "https://ru.freepik.com/free-photo/three-buckets-with-sand-spade-beach_991233.htm",
      platform: "Freepik",
      platformLink: "https://ru.freepik.com"
    },
    {
      author: "freepik",
      authorLink: "https://ru.freepik.com/free-photo/flat-lay-birthday-composition-with-balloons_4165932.htm",
      platform: "Freepik",
      platformLink: "https://ru.freepik.com"
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Заголовок */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Image sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: '#1976d2',
            mb: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            בעלי זכויות
          </Typography>
          <Typography variant="h4" sx={{ 
            fontWeight: 600, 
            color: '#1976d2',
            mb: 2
          }}>
            Attribution
          </Typography>
          <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
            סימבה מלך הצעצועים - Simba King of Toys
          </Typography>
          <Chip 
            label={`עדכון אחרון / Last Update: ${new Date().toLocaleDateString('he-IL')}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="body1">
            <strong>חשוב / Important:</strong> {t('attribution.intro')}
          </Typography>
        </Alert>

        {/* Основные разделы */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              1. {t('attribution.sources')} / Image Sources
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>1.1. {t('attribution.description')} / Image Attribution</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t('attribution.intro')}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                {t('attribution.sources')}:
              </Typography>
              <List dense>
                {attributionSources.map((source, index) => (
                  <ListItem key={index} sx={{ 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1, 
                    mb: 1,
                    background: '#fafafa'
                  }}>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhotoCamera sx={{ fontSize: 20, color: '#1976d2' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {t('attribution.image')} {index + 1}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" component="span">
                            <strong>{t('attribution.author')}:</strong> {' '}
                            <Link href={source.authorLink} target="_blank" rel="noopener noreferrer" sx={{ color: '#1976d2' }}>
                              {source.author}
                            </Link>
                          </Typography>
                          <br />
                          <Typography variant="body2" component="span">
                            <strong>{t('attribution.platform')}:</strong> {' '}
                            <Link href={source.platformLink} target="_blank" rel="noopener noreferrer" sx={{ color: '#1976d2' }}>
                              {source.platform}
                            </Link>
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              2. {t('attribution.note')} / Important Notes
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>{t('attribution.note')}:</strong> {t('attribution.noteText')}
              </Typography>
            </Alert>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>2.1. {t('attribution.platform')}s / Platforms</strong>
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Pixabay"
                  secondary="Free stock photos and illustrations under Pixabay License"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Freepik"
                  secondary="Premium and free vector graphics, photos and PSD files"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Unsplash"
                  secondary="Beautiful free images and photos you can use everywhere"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>2.2. {t('attribution.author')} Rights / Author Rights</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              All images are used in accordance with the respective platform licenses. 
              If you are the author of an image and would like to make changes to the attribution, 
              please contact us.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              3. {t('attribution.platform')} Information / Platform Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>3.1. Pixabay License</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Pixabay License allows you to use images for commercial and noncommercial purposes 
              without attribution, though attribution is appreciated.
            </Typography>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>3.2. Freepik License</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Freepik images can be used for personal and commercial projects with proper attribution.
            </Typography>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>3.3. Unsplash License</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Unsplash photos can be used for free for commercial and noncommercial purposes.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 4, p: 3, background: '#e8f5e8', borderRadius: 2, border: '1px solid #c8e6c9' }}>
          <Typography variant="body2" sx={{ color: '#2e7d32', textAlign: 'center' }}>
            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
            <strong>✓ {t('attribution.note')}:</strong> {t('attribution.noteText')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AttributionPage; 
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
  AccordionDetails
} from '@mui/material';
import { 
  ExpandMore, 
  Security, 
  PrivacyTip, 
  Cookie, 
  Email, 
  Phone,
  LocationOn,
  Business,
  VerifiedUser,
  Shield
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Заголовок */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Security sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: '#1976d2',
            mb: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            מדיניות פרטיות
          </Typography>
          <Typography variant="h4" sx={{ 
            fontWeight: 600, 
            color: '#1976d2',
            mb: 2
          }}>
            Privacy Policy
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
            <strong>חשוב / Important:</strong> מדיניות פרטיות זו מסדירה את איסוף, שימוש, אחסון והגנה על המידע האישי שלך בעת השימוש בחנות הצעצועים המקוונת שלנו.
          </Typography>
        </Alert>

        {/* Основные разделы */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              1. הוראות כלליות / General Provisions
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>1.1. הגדרות / Definitions</strong>
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="נתונים אישיים / Personal Data" 
                  secondary="כל מידע המתייחס לאדם טבעי שניתן לזיהוי ישיר או עקיף"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="עיבוד נתונים / Data Processing" 
                  secondary="כל פעולה או מערכת פעולות המתבצעות על נתונים אישיים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="האחראי / Data Controller" 
                  secondary={`סימבה מלך הצעצועים בע"מ, האחראי על עיבוד הנתונים האישיים`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="המשתמש / User" 
                  secondary="אדם טבעי המשתמש בחנות המקוונת שלנו"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>1.2. בסיס משפטי / Legal Basis</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              עיבוד הנתונים מבוסס על:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary={`• חוק הגנת הפרטיות, התשמ"א-1981`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={`• תקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={`• חוק הגנת הצרכן, התשמ"א-1981`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={`• תקנות הגנת הצרכן (מכירה מרחוק), התשס"א-2001`}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              2. איסוף נתונים אישיים / Personal Data Collection
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>2.1. נתונים שאנו אוספים / Data We Collect</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="2.1.1. מידע אישי / Personal Information"
                  secondary={`שם מלא, כתובת דוא"ל, מספר טלפון, כתובת מגורים`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2.1.2. מידע הזמנה / Order Information"
                  secondary="פרטי הזמנה, היסטוריית רכישות, העדפות מוצרים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2.1.3. מידע טכני / Technical Information"
                  secondary="כתובת IP, סוג דפדפן, מערכת הפעלה, נתוני ניווט"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2.1.4. מידע תשלום / Payment Information"
                  secondary="פרטי כרטיס אשראי (מוצפנים), היסטוריית תשלומים"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>2.2. מטרות האיסוף / Collection Purposes</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="• ביצוע הזמנות / Order Processing"
                  secondary="עיבוד הזמנות, תשלומים ומשלוחים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• שירות לקוחות / Customer Service"
                  secondary="תמיכה טכנית, מענה לפניות, פתרון בעיות"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• שיווק ופרסום / Marketing"
                  secondary="שליחת עדכונים, מבצעים והצעות (בהסכמה)"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• שיפור השירות / Service Improvement"
                  secondary="ניתוח שימוש, אופטימיזציה של האתר"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              3. שימוש בנתונים / Data Usage
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>3.1. שימוש פנימי / Internal Use</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="3.1.1. עיבוד הזמנות / Order Processing"
                  secondary="שימוש בנתונים לביצוע הזמנות ומשלוחים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3.1.2. תקשורת / Communication"
                  secondary="שליחת עדכונים על סטטוס הזמנות"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3.1.3. שירות לקוחות / Customer Support"
                  secondary="מענה לפניות ותמיכה טכנית"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>3.2. שיתוף עם צדדים שלישיים / Third-Party Sharing</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="3.2.1. ספקי שירות / Service Providers"
                  secondary="חברות משלוחים, ספקי תשלום, שירותי ענן"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3.2.2. דרישות חוק / Legal Requirements"
                  secondary="מסירת מידע לפי דרישת חוק או צו בית משפט"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3.2.3. הגנה על זכויות / Rights Protection"
                  secondary="מסירת מידע להגנה על זכויות החברה או המשתמשים"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              4. אבטחת מידע / Data Security
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>4.1. אמצעי הגנה / Protection Measures</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="4.1.1. הצפנה / Encryption"
                  secondary="הצפנת SSL/TLS לכל התקשורת, הצפנת נתונים רגישים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="4.1.2. גישה מוגבלת / Access Control"
                  secondary="הגבלת גישה לנתונים רק לעובדים מורשים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="4.1.3. גיבוי / Backup"
                  secondary="גיבוי קבוע ומוצפן של כל הנתונים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="4.1.4. ניטור / Monitoring"
                  secondary="ניטור מתמיד של מערכות האבטחה"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>4.2. פרוטוקולי אבטחה / Security Protocols</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="• עדכונים קבועים / Regular Updates"
                  secondary="עדכון שוטף של מערכות האבטחה"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• בדיקות חדירה / Penetration Testing"
                  secondary="בדיקות אבטחה תקופתיות"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• הכשרת עובדים / Employee Training"
                  secondary="הכשרה שוטפת בנושאי אבטחת מידע"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              5. זכויות המשתמש / User Rights
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>5.1. זכות הגישה / Right of Access</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="5.1.1. צפייה בנתונים / Data Viewing"
                  secondary="זכות לצפות בכל הנתונים האישיים שלנו"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="5.1.2. העתקה / Copying"
                  secondary="זכות לקבל עותק של הנתונים האישיים"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>5.2. זכות תיקון / Right of Correction</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="5.2.1. עדכון נתונים / Data Update"
                  secondary="זכות לתקן או לעדכן נתונים לא מדויקים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="5.2.2. השלמה / Completion"
                  secondary="זכות להשלים נתונים חסרים"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>5.3. זכות מחיקה / Right of Deletion</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="5.3.1. מחיקת חשבון / Account Deletion"
                  secondary="זכות למחוק את החשבון וכל הנתונים הקשורים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="5.3.2. מחיקת נתונים ספציפיים / Specific Data Deletion"
                  secondary="זכות למחוק נתונים ספציפיים"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>5.4. זכות התנגדות / Right of Objection</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="5.4.1. התנגדות לעיבוד / Processing Objection"
                  secondary="זכות להתנגד לעיבוד נתונים למטרות שיווק"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="5.4.2. ביטול הסכמה / Consent Withdrawal"
                  secondary="זכות לבטל הסכמה בכל עת"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              6. עוגיות וטכנולוגיות דומות / Cookies and Similar Technologies
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>6.1. סוגי עוגיות / Types of Cookies</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="6.1.1. עוגיות הכרחיות / Essential Cookies"
                  secondary="נדרשות לפעולת האתר הבסיסית"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="6.1.2. עוגיות ביצועים / Performance Cookies"
                  secondary="מסייעות בשיפור ביצועי האתר"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="6.1.3. עוגיות פונקציונליות / Functional Cookies"
                  secondary="מאפשרות פונקציות מתקדמות"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="6.1.4. עוגיות שיווק / Marketing Cookies"
                  secondary="משמשות לפרסום ממוקד (בהסכמה)"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>6.2. ניהול עוגיות / Cookie Management</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="6.2.1. הגדרות דפדפן / Browser Settings"
                  secondary="ניתן לחסום עוגיות בהגדרות הדפדפן"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="6.2.2. כלי ניהול / Management Tools"
                  secondary="כלים לניהול העדפות עוגיות באתר"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              7. אחסון נתונים / Data Storage
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>7.1. משך אחסון / Storage Duration</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="7.1.1. נתוני חשבון / Account Data"
                  secondary="נשמרים כל עוד החשבון פעיל או עד 7 שנים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="7.1.2. נתוני הזמנות / Order Data"
                  secondary="נשמרים 7 שנים לצורכי חשבונאות ומס"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="7.1.3. נתוני תשלום / Payment Data"
                  secondary="נשמרים בהתאם לדרישות רגולטוריות"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="7.1.4. נתוני ניווט / Navigation Data"
                  secondary="נשמרים עד 2 שנים לניתוח שימוש"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>7.2. מיקום אחסון / Storage Location</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="7.2.1. שרתים מקומיים / Local Servers"
                  secondary="הנתונים נשמרים בשרתים בישראל"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="7.2.2. שירותי ענן / Cloud Services"
                  secondary="שימוש בשירותי ענן מאובטחים"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              8. העברת נתונים / Data Transfer
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>8.1. העברות פנימיות / Internal Transfers</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="8.1.1. בתוך ישראל / Within Israel"
                  secondary="העברת נתונים בין מערכות החברה"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="8.1.2. אבטחה / Security"
                  secondary="כל ההעברות מוצפנות ומאובטחות"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>8.2. העברות בינלאומיות / International Transfers</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="8.2.1. ספקי שירות / Service Providers"
                  secondary="העברת נתונים לספקי שירות בינלאומיים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="8.2.2. הגנות / Protections"
                  secondary="הגנות מתאימות לכל העברת נתונים"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              9. פרצות אבטחה / Security Breaches
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>9.1. זיהוי וטיפול / Identification and Response</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="9.1.1. ניטור / Monitoring"
                  secondary="ניטור מתמיד לאיתור פרצות אבטחה"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="9.1.2. תגובה מהירה / Rapid Response"
                  secondary="תגובה מיידית לכל פרצת אבטחה"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="9.1.3. תיעוד / Documentation"
                  secondary="תיעוד מלא של כל פרצה ותגובה"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>9.2. הודעה למשתמשים / User Notification</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="9.2.1. הודעה מיידית / Immediate Notification"
                  secondary="הודעה תוך 72 שעות מפרצת אבטחה"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="9.2.2. פרטי הפרצה / Breach Details"
                  secondary="מידע על סוג הפרצה והשפעותיה"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="9.2.3. צעדי הגנה / Protective Measures"
                  secondary="הנחיות לצעדי הגנה למשתמשים"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              10. ילדים וקטינים / Children and Minors
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>10.1. הגנה על ילדים / Child Protection</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="10.1.1. גיל מינימום / Minimum Age"
                  secondary="השירות מיועד למשתמשים מעל גיל 13"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="10.1.2. הסכמת הורים / Parental Consent"
                  secondary="נדרשת הסכמת הורים למשתמשים מתחת לגיל 16"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="10.1.3. הגבלות / Restrictions"
                  secondary="הגבלות על איסוף נתונים מילדים"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>10.2. פיקוח הורי / Parental Control</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="10.2.1. גישה לנתונים / Data Access"
                  secondary="הורים יכולים לגשת לנתוני ילדיהם"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="10.2.2. מחיקה / Deletion"
                  secondary="הורים יכולים למחוק נתוני ילדיהם"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              11. שינויים במדיניות / Policy Changes
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>11.1. עדכון המדיניות / Policy Updates</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="11.1.1. שינויים / Changes"
                  secondary="החברה רשאית לעדכן מדיניות זו מעת לעת"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="11.1.2. הודעה / Notification"
                  secondary="משתמשים יקבלו הודעה על שינויים משמעותיים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="11.1.3. הסכמה / Consent"
                  secondary="המשך השימוש מהווה הסכמה למדיניות המעודכנת"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>11.2. היסטוריית שינויים / Change History</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="11.2.1. תיעוד / Documentation"
                  secondary="כל השינויים מתועדים עם תאריכים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="11.2.2. נגישות / Accessibility"
                  secondary="היסטוריית השינויים נגישה למשתמשים"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              12. יצירת קשר / Contact Information
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              לכל שאלה בנושא פרטיות:
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Email sx={{ color: '#1976d2' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {`דוא"ל / Email`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    privacy@simba-toys.co.il
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Phone sx={{ color: '#1976d2' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    טלפון / Phone
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    053-377-4509
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationOn sx={{ color: '#1976d2' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    כתובת / Address
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    רחוב הרצל 123, תל אביב, ישראל
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Business sx={{ color: '#1976d2' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    פרטי החברה / Company Details
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {`סימבה מלך הצעצועים בע"מ, ח.פ. 123456789`}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>שעות פעילות / Business Hours:</strong> א'-ה': 9:00-18:00, ו': 9:00-14:00
              </Typography>
            </Alert>
          </AccordionDetails>
        </Accordion>

        {/* Заключение */}
        <Box sx={{ mt: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
            סיכום / Summary
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            מדיניות פרטיות זו מבטיחה הגנה על הנתונים האישיים שלך בהתאם לחוק הישראלי. 
            אנו מחויבים לשמירה על פרטיותך ואבטחת המידע שלך.
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            עדכון אחרון / Last Update: {new Date().toLocaleDateString('he-IL')}
          </Typography>
        </Box>

        {/* Подпись */}
        <Box sx={{ mt: 4, textAlign: 'center', p: 3, borderTop: '2px solid #e0e0e0' }}>
          <VerifiedUser sx={{ fontSize: 40, color: '#4caf50', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50' }}>
            שומרים על הפרטיות שלך / Protecting Your Privacy
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            אנו מחויבים לשמירה על הנתונים האישיים שלך ולספק חוויית קנייה בטוחה
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

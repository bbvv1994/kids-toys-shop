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
  Gavel, 
  Description, 
  Security, 
  ShoppingCart,
  Payment,
  LocalShipping,
  Support,
  Warning,
  CheckCircle,
  Email
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Заголовок */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Gavel sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
          <Typography variant="h3" sx={{ 
            fontWeight: 700, 
            color: '#1976d2',
            mb: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            תנאי שימוש
          </Typography>
          <Typography variant="h4" sx={{ 
            fontWeight: 600, 
            color: '#1976d2',
            mb: 2
          }}>
            Terms of Service
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
            <strong>חשוב / Important:</strong> תנאי שימוש אלה מסדירים את היחסים בין המשתמשים לבין חנות הצעצועים המקוונת. השימוש באתר שלנו מהווה הסכמה לתנאים אלה.
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
                  primary="חנות / Store" 
                  secondary="חנות הצעצועים המקוונת הזמינה בכתובת simba-toys.co.il"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="משתמש / User" 
                  secondary="אדם טבעי המשתמש באתר החנות"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="מוצר / Product" 
                  secondary="צעצועים לילדים ומוצרים נלווים המוצגים בקטלוג"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="הזמנה / Order" 
                  secondary="חוזה מכר הנכרת בין המשתמש לבין החנות"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>1.2. בסיס משפטי / Legal Basis</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              היחסים מוסדרים על ידי:
            </Typography>
            <List dense>
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
              <ListItem>
                <ListItemText 
                  primary={`• חוק המכר, התשכ"ח-1968`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={`• חוק הגנת הפרטיות, התשמ"א-1981`}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              2. רישום וחשבון / Registration and Account
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>2.1. דרישות רישום / Registration Requirements</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="2.1.1. גיל / Age"
                  secondary="הרישום אפשרי לבני 14 ומעלה. לבני פחות מ-14 נדרשת הסכמת הורים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2.1.2. אמינות נתונים / Data Accuracy"
                  secondary="המשתמש מתחייב לספק מידע אמין ועדכני"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="2.1.3. אבטחת חשבון / Account Security"
                  secondary="המשתמש אחראי לשמירה על פרטי החשבון"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>2.2. פעולות אסורות / Prohibited Actions</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="• שימוש בחשבונות אחרים / Using Others' Accounts"
                  secondary="אסור השימוש בחשבונות של אחרים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• יצירת חשבונות מרובים / Multiple Accounts"
                  secondary="אסור יצירת מספר חשבונות על ידי אותו אדם"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="• פגיעה באבטחה / Security Violations"
                  secondary="אסורות ניסיונות פריצה או פגיעה בעבודת האתר"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              3. מוצרים ומחירים / Products and Prices
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>3.1. מידע על מוצרים / Product Information</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="3.1.1. תיאור מוצרים / Product Descriptions"
                  secondary="החנות מספקת תיאורים מפורטים, תמונות ומאפיינים של המוצרים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3.1.2. זמינות מוצרים / Product Availability"
                  secondary="זמינות המוצרים מצוינת בדף המוצר. החנות שומרת לעצמה את הזכות לשנות זמינות"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3.1.3. איכות מוצרים / Product Quality"
                  secondary="כל המוצרים עומדים בדרישות הבטיחות ויש להם תעודות נדרשות"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>3.2. מחירים ותשלום / Prices and Payment</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="3.2.1. מחירים / Prices"
                  secondary={`המחירים מצוינים בשקלים וכוללים מע"מ. החנות שומרת לעצמה את הזכות לשנות מחירים`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3.2.2. אמצעי תשלום / Payment Methods"
                  secondary="מזומן בעת קבלה, כרטיסי אשראי, תשלומים אלקטרוניים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="3.2.3. אבטחת תשלומים / Payment Security"
                  secondary="כל התשלומים מוגנים בטכנולוגיות הצפנה מודרניות"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              4. ביצוע הזמנות / Order Processing
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>4.1. תהליך ביצוע הזמנה / Order Process</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="4.1.1. בחירת מוצרים / Product Selection"
                  secondary="המשתמש בוחר מוצרים ומוסיף אותם לעגלה"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="4.1.2. אישור הזמנה / Order Confirmation"
                  secondary={`לאחר ביצוע ההזמנה המשתמש מקבל אישור בדוא"ל`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="4.1.3. שינוי הזמנה / Order Modification"
                  secondary="שינויים אפשריים עד העברת ההזמנה למשלוח"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>4.2. ביצוע הזמנה / Order Execution</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="4.2.1. זמני ביצוע / Processing Times"
                  secondary="הזמנות מבוצעות תוך 1-3 ימי עבודה"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="4.2.2. הודעות / Notifications"
                  secondary="המשתמש מקבל הודעות על סטטוס ההזמנה"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="4.2.3. ביטול הזמנה / Order Cancellation"
                  secondary="המשתמש יכול לבטל הזמנה עד העברתה למשלוח"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              5. משלוח / Delivery
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>5.1. אמצעי משלוח / Delivery Methods</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="5.1.1. משלוח שליח / Courier Delivery"
                  secondary="משלוח על ידי שליח לכתובת שציין המשתמש"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="5.1.2. נקודות איסוף / Pickup Points"
                  secondary="קבלת ההזמנה בנקודות איסוף הזמנות"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="5.1.3. משלוח דואר / Postal Delivery"
                  secondary="משלוח דואר ישראל לאזורים מרוחקים"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>5.2. עלות וזמני משלוח / Delivery Cost and Times</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="5.2.1. עלות / Cost"
                  secondary="עלות המשלוח מחושבת אוטומטית בעת ביצוע ההזמנה"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="5.2.2. זמנים / Times"
                  secondary="זמני המשלוח תלויים באמצעי הנבחר והאזור"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="5.2.3. משלוח חינם / Free Delivery"
                  secondary="משלוח חינם בהזמנה מעל 150 שקל"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>5.3. קבלת הזמנה / Order Receipt</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="5.3.1. בדיקת מוצר / Product Inspection"
                  secondary="המשתמש רשאי לבדוק את המוצר בעת קבלתו"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="5.3.2. מסמכים / Documents"
                  secondary="בעת קבלה מסופקים חשבונית וערבות"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              6. החזרה והחלפה / Returns and Exchanges
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>6.1. זכות החזרה / Right of Return</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="6.1.1. תקופת החזרה / Return Period"
                  secondary="החזרה אפשרית תוך 14 יום ממועד קבלת המוצר"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="6.1.2. תנאי החזרה / Return Conditions"
                  secondary="המוצר חייב להיות באריזה המקורית ולא בשימוש"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="6.1.3. חריגים / Exceptions"
                  secondary="לא ניתנים להחזרה מוצרי היגיינה אישית וקטגוריות מסוימות"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>6.2. הליך החזרה / Return Procedure</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="6.2.1. בקשה / Request"
                  secondary="המשתמש מגיש בקשה להחזרה דרך החשבון האישי"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="6.2.2. החזרת מוצר / Product Return"
                  secondary="המוצר מוחזר על ידי שליח או בנקודת איסוף"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="6.2.3. החזרת כספים / Refund"
                  secondary="הכספים מוחזרים תוך 10 ימי עבודה"
                />
              </ListItem>
            </List>

            <Alert severity="warning" sx={{ mt: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>חשוב / Important:</strong> בהחזרת מוצר באיכות לא טובה החנות מחזירה את עלות המשלוח.
              </Typography>
            </Alert>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              7. אחריות ואחריות / Warranties and Liability
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>7.1. אחריות החנות / Store Warranties</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="7.1.1. איכות מוצרים / Product Quality"
                  secondary="החנות ערבה להתאמת המוצרים למאפיינים המוצהרים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="7.1.2. בטיחות / Safety"
                  secondary="כל המוצרים עומדים בדרישות הבטיחות לילדים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="7.1.3. הסמכה / Certification"
                  secondary="למוצרים יש תעודות איכות נדרשות"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>7.2. הגבלת אחריות / Limitation of Liability</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="7.2.1. נזק / Damage"
                  secondary="החנות אינה אחראית לנזק עקיף"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="7.2.2. סכום אחריות / Liability Amount"
                  secondary="האחריות מוגבלת לעלות ההזמנה"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="7.2.3. כוח עליון / Force Majeure"
                  secondary="החנות אינה אחראית במקרה של נסיבות כוח עליון"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              8. קניין רוחני / Intellectual Property
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>8.1. זכויות החנות / Store Rights</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="8.1.1. תוכן האתר / Website Content"
                  secondary="כל התוכן באתר הוא קניין רוחני של החנות"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="8.1.2. סימני מסחר / Trademarks"
                  secondary="לוגואים וסימני מסחר מוגנים בזכויות יוצרים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="8.1.3. עיצוב / Design"
                  secondary="העיצוב והמבנה של האתר הם קניין החנות"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>8.2. שימוש בתוכן / Content Usage</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="8.2.1. אסור / Prohibited"
                  secondary="העתקה, שכפול, הפצה של תוכן ללא אישור"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="8.2.2. מותר / Permitted"
                  secondary="שימוש למטרות אישיות במסגרת החוק"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              9. פרטיות ואבטחה / Privacy and Security
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>9.1. הגנה על נתונים אישיים / Personal Data Protection</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="9.1.1. איסוף נתונים / Data Collection"
                  secondary="החנות אוספת רק נתונים אישיים נדרשים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="9.1.2. שימוש / Usage"
                  secondary="הנתונים משמשים אך ורק למתן שירותים"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="9.1.3. הגנה / Protection"
                  secondary="מוחלים שיטות הגנה מודרניות על נתונים"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>9.2. אבטחת האתר / Website Security</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="9.2.1. הצפנת SSL / SSL Encryption"
                  secondary="כל הנתונים מועברים בחיבור מוגן"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="9.2.2. ניטור / Monitoring"
                  secondary="ניטור מתמיד של אבטחת האתר"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              10. פתרון סכסוכים / Dispute Resolution
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>10.1. יישוב טרום משפטי / Pre-Litigation Resolution</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="10.1.1. תלונות / Complaints"
                  secondary="סכסוכים נפתרים על ידי הגשת תלונה לחנות"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="10.1.2. זמן בדיקה / Review Time"
                  secondary="תלונות נבדקות תוך 30 יום"
                />
              </ListItem>
            </List>

            <Typography variant="body1" sx={{ mb: 2, mt: 3 }}>
              <strong>10.2. הליך משפטי / Legal Proceedings</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="10.2.1. סמכות שיפוט / Jurisdiction"
                  secondary="סכסוכים נדונים בבית המשפט במקום מושב החנות"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="10.2.2. דין חל / Applicable Law"
                  secondary="הדין החל הוא דין מדינת ישראל"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              11. שינוי תנאים / Terms Changes
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>11.1. זכות לשינויים / Right to Changes</strong>
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="11.1.1. שינויים / Changes"
                  secondary="החנות שומרת לעצמה את הזכות לשנות תנאי שימוש"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="11.1.2. הודעות / Notifications"
                  secondary={`משתמשים מקבלים הודעה על שינויים דרך האתר ודוא"ל`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="11.1.3. הסכמה / Consent"
                  secondary="המשך השימוש מהווה הסכמה לתנאים החדשים"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
              12. פרטי קשר / Contact Information
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ mb: 2 }}>
              לכל שאלה פנו אלינו:
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Support sx={{ color: '#1976d2' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    שירות לקוחות / Customer Service
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Email: simbakingoftoys@gmail.com
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocalShipping sx={{ color: '#1976d2' }} />
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
                <Email sx={{ color: '#1976d2' }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    שאלות כלליות / General Questions
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    info@simba-toys.co.il
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
            תנאי שימוש אלה הם מחייבים לכל המשתמשים באתר. 
            השימוש בחנות המקוונת שלנו מהווה אישור שהכרת ואתה מסכים לתנאים אלה.
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            עדכון אחרון / Last Update: {new Date().toLocaleDateString('he-IL')}
          </Typography>
        </Box>

        {/* Подпись */}
        <Box sx={{ mt: 4, textAlign: 'center', p: 3, borderTop: '2px solid #e0e0e0' }}>
          <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#4caf50' }}>
            שותף אמין לילדיכם / Reliable Partner for Your Children
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            אנו שואפים לספק את השירות הטוב ביותר ומוצרים איכותיים להתפתחות ילדיכם
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

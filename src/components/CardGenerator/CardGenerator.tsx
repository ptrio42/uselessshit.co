import React, {createRef, RefObject, useEffect, useRef, useState} from 'react';
import {Box, styled} from "@mui/material";
import { jsPDF } from 'jspdf';
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {useFormik} from "formik";
import Input from "@mui/material/Input";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import CardActions from "@mui/material/CardActions";
import {LightningGift} from "../LightningGift/LightningGift";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import InputAdornment from "@mui/material/InputAdornment";
import QRCode from "react-qr-code";
import html2canvas from 'html2canvas';
import {LoadingAnimation} from "../LoadingAnimation/LoadingAnimation";
import './CardGenerator.css';
import {Helmet} from "react-helmet";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import { SketchPicker } from 'react-color';
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import {Info} from "@mui/icons-material";
import Slider from "@mui/material/Slider";
import '../../fonts/Merriweather-Regular-normal';

enum CardType {
    BusinessCard = 'business-card',
    Bookmark = 'bookmark',
    Sticker = 'sticker'
}

interface CardsConfig {
    [key: string]: {
        format: number[],
        orientation: 'p' | 'l' | 'portrait' | 'landscape',
        primaryImageFormat?: number[],
        secondaryImageFormat?: number[],
        qrCodeSize: number
    }
}

const cardsConfig: CardsConfig = {
    [CardType.BusinessCard]: {
        format: [3.5, 2],
        orientation: 'landscape',
        primaryImageFormat: [0.75, 0.75],
        secondaryImageFormat: [0.75, 0.75],
        qrCodeSize: 72
    },
    [CardType.Bookmark]: {
        format: [2, 6],
        orientation: 'portrait',
        primaryImageFormat: [0.75, 0.75],
        secondaryImageFormat: [0.75, 0.75],
        qrCodeSize: 72
    },
    [CardType.Sticker]: {
        format: [3.5, 3.5],
        orientation: 'landscape',
        primaryImageFormat: [1, 1],
        secondaryImageFormat: [1, 1],
        qrCodeSize: 96
    }
};

interface CardProps {
    slogan: string;
    sloganColor: string;
    sloganFontSize: number;
    mainImage: any;
    backgroundImage?: any;
    satsAmount?: number;
    copies: number;
    type: CardType;
    url: string;
    urlColor: string;
    urlFontSize: number;
    receiveAddress?: string;
    config: any;
}

const initialCardProps: CardProps = {
    slogan: 'CY₿ERPOWER.',
    sloganColor: '#000000',
    sloganFontSize: 14,
    // mainImage: new Image().src = process.env.PUBLIC_URL + '/images/bitcoin.png',
    mainImage: null,
    satsAmount: 0,
    copies: 1,
    backgroundImage: null,
    type: CardType.BusinessCard,
    url: 'https://uselessshit.co/#were-handed-a-card',
    urlColor: '#1B3D2F',
    urlFontSize: 10,
    receiveAddress: '',
    config: { ...cardsConfig[CardType.BusinessCard] }
};

const Item = styled(Paper)(({ theme }) => ({
    background: 'transparent',
    boxShadow: 'none',
    ...theme.typography.body2
}));

export const CardGenerator = () => {
    const [cardProps, setCardProps] = useState<CardProps>({ ...initialCardProps });

    const [includeLightningGift, setIncludeLightningGift] = useState(false);

    const [lnurls, setLnurls] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    const [qrCodeRefs, setQrCodeRefs] = useState<RefObject<unknown>[]>([]);

    useEffect(() => {
        setQrCodeRefs((qrCodeRefs) =>
            Array(cardProps.copies)
                .fill(undefined)
                .map((_, i) => qrCodeRefs[i] || createRef())
        );
    }, [cardProps.copies]);

    useEffect(() => {
        setCardProps((props) => ({
            ...props,
            config: { ...cardsConfig[props.type] },
            receiveAddress: '',
            copies: 1,
        }));
        setIncludeLightningGift(false);
    }, [cardProps.type]);

    const formik = useFormik({
        initialValues: {
            ...initialCardProps
        },
        onSubmit: (values) => {
            setCardProps({
                ...cardProps,
                slogan: values.slogan
            });
        }
    });

    const toggleIncludeLightningGift = () => {
        setIncludeLightningGift(!includeLightningGift);
    };

    const handleIsLoading = (isLoading: boolean) => {
        setIsLoading(isLoading);
    };

    const handleSetCopies = (copies: number) => {
        if (copies === 0) {
            copies = 1;
        }
        if (cardProps.type === CardType.BusinessCard && copies > 9) {
            copies = 9;
        }
        if (cardProps.type === CardType.Bookmark && copies > 5) {
            copies = 5;
        }
        if (cardProps.type === CardType.Sticker && copies > 6) {
            copies = 6;
        }

        copies = +copies;

        setCardProps({
            ...cardProps,
            copies
        });
    };

    const cardHTML = () => (
        <React.Fragment>
            <Typography variant="h6" component="div" gutterBottom sx={{ textAlign: 'left' }}>
                Card Preview
            </Typography>
            <Card sx={{
                width: `${cardsConfig[cardProps.type].format[0]}in`,
                height: `${cardsConfig[cardProps.type].format[1]}in`,
                margin: '0 auto 3em auto',
                background: cardProps.backgroundImage ? `url(${cardProps.backgroundImage})` : 'none',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPositionY: cardProps.type === CardType.Bookmark ? '2in' : '0'
            }}>
                <CardActionArea sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: cardProps.type === CardType.BusinessCard ? 'center' : 'flex-start' }}
                >
                    <Box sx={{ display: 'flex', justifyContent: cardProps.type === CardType.BusinessCard ? 'center' : 'flex-start' }}>
                        <CardMedia
                            component="img"
                            sx={{
                                width: `${cardProps.config.primaryImageFormat[0]}in`,
                                height: `${cardProps.config.primaryImageFormat[1]}in`,
                                objectFit: 'fill',
                                marginTop: cardProps.type === CardType.BusinessCard ? 0 : '0.15in'
                            }}
                            image={cardProps.mainImage}
                        />
                        {
                            (includeLightningGift || (cardProps.type === CardType.Sticker && cardProps.receiveAddress && cardProps.receiveAddress !== '')) &&
                            <Box
                                sx={{
                                    width: `${cardProps.config.secondaryImageFormat[0]}in`,
                                    height: `${cardProps.config.secondaryImageFormat[1]}in`,
                                    marginLeft: '0.1in',
                                    marginTop: cardProps.type === CardType.BusinessCard ? 0 : '0.15in',
                                    overflow: 'hidden'
                                }}
                            >
                                {
                                    Array(cardProps.copies).fill(undefined).map((_, i) => (
                                        <Box
                                            sx={{
                                                width: `${cardProps.config.secondaryImageFormat[0]}in`,
                                                height: `${cardProps.config.secondaryImageFormat[1]}in`,
                                                margin: '0',
                                                padding: '0'
                                            }}
                                            ref={qrCodeRefs[i]}
                                        >
                                            <QRCode size={cardProps.config.qrCodeSize} value={lnurls[i] || cardProps.receiveAddress || '' } />
                                        </Box>
                                    ))
                                }
                            </Box>

                        }
                    </Box>
                    <CardContent>
                        <Typography sx={{ fontSize: `${cardProps.sloganFontSize}pt`, color: cardProps.sloganColor, maxWidth: `${cardProps.config.format[0] - 0.5}in`, overflow: 'hidden', overflowWrap: 'break-word' }} gutterBottom variant="h5" component="div">
                            {cardProps.slogan}
                        </Typography>
                    </CardContent>
                        <CardActions>
                        <Typography sx={{ fontSize: `${cardProps.urlFontSize}pt`, color: cardProps.urlColor }}>
                            { cardProps.url }
                        </Typography>
                    </CardActions>
                </CardActionArea>
            </Card>
        </React.Fragment>
    );

    const getCardFormat = () => {
        const format = cardsConfig[cardProps.type].format;

        switch (cardProps.type) {
            case CardType.BusinessCard:
            case CardType.Sticker: {
                if (cardProps.copies > 3) {
                    return [
                        format[0] * 3,
                        format[1] * Math.ceil(cardProps.copies / 3)
                    ];
                } else {
                    return [
                        format[0] * cardProps.copies,
                        format[1]
                    ];
                }
            }
            case CardType.Bookmark: {
                return [
                    format[0] * cardProps.copies,
                    format[1]
                ];
            }
        }
    };

    const getMainImagePosition = (iterator: number) => {
        const position = {
            x: 0,
            y: 0
        };
        const format = cardsConfig[cardProps.type].format;

        switch (cardProps.type) {
            case CardType.BusinessCard:
            case CardType.Sticker: {
                if (iterator > 2) {
                    position.x = (format[0] / 2) + (((iterator + 1) % 3) * format[0]);
                    position.y = 0.375 + ((Math.floor(iterator / 3)) * format[1]);
                } else {
                    position.x = (format[0] / 2) + (iterator * format[0]);
                    position.y = 0.375;
                }
                break;
            }

            case CardType.Bookmark: {
                position.x = (format[0] / 2) + (iterator * format[0]);
                position.y = 0.375;
                break;
            }
        }

        if (includeLightningGift || (cardProps.type === CardType.Sticker && cardProps.receiveAddress)) {
            position.x -= (cardProps.config.primaryImageFormat[0] + 0.05);
        } else {
            position.x -= cardProps.config.primaryImageFormat[0] / 2;
        }
        return position;
    };

    const getBackgroundImagePosition = (iterator: number) => {
        const position = {
            x: 0,
            y: 0
        };
        if (iterator > 2) {
            position.x = (((iterator + 1) % 3) * cardsConfig[cardProps.type].format[0]);
            position.y = (cardsConfig[cardProps.type].format[1] * (Math.floor(iterator / 3)));
        } else {
            position.x = (iterator * cardsConfig[cardProps.type].format[0]);
            position.y = 0;
        }
        return position;
    };

    const getQrCodeImagePosition = (iterator: number) => {
        let { x, y } = getMainImagePosition(iterator);
        x += cardProps.config.primaryImageFormat[0] + 0.1;
        return { x, y };
    };

    const getMainTextPosition = (iterator: number) => {
        const position = {
            x: 0,
            y: 0
        };
        const format = cardsConfig[cardProps.type].format;
        const mainImagePosition = getMainImagePosition(iterator);
        const mainImageFormat = cardProps.config.primaryImageFormat[1];
        const relativeTextPosition = mainImagePosition.y + mainImageFormat;

        switch (cardProps.type) {
            case CardType.BusinessCard:
            case CardType.Sticker: {
                if (iterator > 2) {
                    position.x = (format[0] / 2) + (((iterator + 1) % 3) * format[0]);
                    position.y = (relativeTextPosition + 0.5) + ((Math.floor(iterator / 3)) * format[1]);
                } else {
                    position.x = (format[0] / 2) + iterator * format[0];
                    position.y = (relativeTextPosition + 0.5);
                }
                break;
            }

            case CardType.Bookmark: {
                position.x = (format[0] / 2) + iterator * format[0];
                position.y = relativeTextPosition + 0.5;
            }
                break;
        }
        return position;
    };

    const getSecondaryTextPosition = (iterator: number) => {
        return {
            x: cardProps.config.format[0] / 2 + cardProps.config.format[0] * (iterator),
            y: ((Math.floor(iterator / 3)) * cardProps.config.format[1]) + cardProps.config.format[1] - 0.15
        };
        let { x, y } = getMainTextPosition(iterator);
        y += 0.6;
        return { x, y };
    };

    const downloadCard = async () => {
        const cardFormat = getCardFormat();
        const card = new jsPDF({
            orientation: cardProps.type === 'bookmark'
            && cardProps.copies > 2 ?
                'landscape' :
                cardsConfig[cardProps.type].orientation,
            unit: 'in',
            format: cardFormat
        });
        handleIsLoading(true);

        if ((cardProps.type === CardType.BusinessCard || cardProps.type === CardType.Sticker) &&
            cardProps.backgroundImage) {
            for (let i = 0; i < cardProps.copies; i++) {
                const backgroundImagePosition = getBackgroundImagePosition(i);
                card.addImage({
                    imageData: new Image().src = cardProps.backgroundImage as string,
                    x: backgroundImagePosition.x,
                    y: backgroundImagePosition.y,
                    width: cardsConfig[cardProps.type].format[0],
                    height: cardsConfig[cardProps.type].format[1]
                });
            }
        }

        for (let i = 0; i < cardProps.copies; i++) {
            if (cardProps.type === CardType.Bookmark && cardProps.backgroundImage) {
                card.addImage({
                    imageData: new Image().src = cardProps.backgroundImage as string,
                    x: (i * cardsConfig[cardProps.type].format[0]),
                    y: cardsConfig[cardProps.type].format[1] - 4,
                    width: 2,
                    height: 4
                });
            }

            card.setFontSize(cardProps.sloganFontSize);
            card.setFont('Merriweather-Regular', 'normal');

            if (cardProps.mainImage) {
                const imageData = new Image();
                imageData.src = cardProps.mainImage as string;
                const imagePosition = getMainImagePosition(i);
                card.addImage({
                    imageData,
                    x: imagePosition.x,
                    y: imagePosition.y,
                    width: cardProps.config.primaryImageFormat[0],
                    height: cardProps.config.primaryImageFormat[1]
                });
            }

            if (includeLightningGift || (cardProps.receiveAddress && cardProps.receiveAddress !== '')) {
                const qrCodeElement: HTMLElement = qrCodeRefs[i].current as unknown as HTMLElement;
                const qrCodeCanvas = await html2canvas(qrCodeElement);
                const qrCodeImage = qrCodeCanvas.toDataURL('image/png');

                const { x, y } = getQrCodeImagePosition(i);
                card.addImage({
                    imageData: qrCodeImage,
                    x,
                    y,
                    width: cardProps.config.secondaryImageFormat[0],
                    height: cardProps.config.secondaryImageFormat[1]
                });
            }

            const textPosition = getMainTextPosition(i);
            const secondaryTextPosition = getSecondaryTextPosition(i);

            card.setTextColor(cardProps.sloganColor);
            card.text(
                cardProps.slogan,
                textPosition.x,
                textPosition.y,
                { align: 'center', maxWidth: cardsConfig[cardProps.type].format[0] - 0.5 }
                );

            card.setFontSize(cardProps.urlFontSize);
            card.setTextColor(cardProps.urlColor);
            card.text(
                cardProps.url,
                secondaryTextPosition.x,
                secondaryTextPosition.y,
                { align: 'center' }
                );
        }

        handleIsLoading(false);
        card.save('custom-card.pdf')
    };

    return (
        <Box sx={{ width: '80%', margin: '1em auto' }}>
            <Helmet>
                <title>Useless Shit - Card Generator</title>
            </Helmet>

            <img height="128" src={process.env.PUBLIC_URL + '/images/spread-the-bitcoin-vibes.png'} />
            <Typography variant="h3" component="div" gutterBottom>
                Card Generator
            </Typography>
            <Typography sx={{ marginBottom: '3em' }} align="justify" gutterBottom>
                Spread bitcoin awareness with personalized business cards & bookmarks.
                With this little tool you can easily create unique graphics (in a print friendly format)
                without the need for an external software (like Gimp or Photoshop).
            </Typography>

            {cardHTML()}

            <Typography gutterBottom component="div" variant="h6" sx={{ textAlign: 'left' }}>
                Create card
            </Typography>
            <form className="card-generator-form" onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                    <Item>
                        <FormControl>
                            <FormLabel id="cardTypeLabel">
                                Format
                                <Tooltip title="Pick a format for your graphic. It can either be a business card size (3.5in by 2.0in) or a bookmark size (2in by 6in).">
                                    <IconButton>
                                        <Info />
                                    </IconButton>
                                </Tooltip>
                            </FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby="card-type-label"
                                value={cardProps.type}
                                onChange={(event)  => {
                                    formik.handleChange(event);
                                    setCardProps({
                                        ...cardProps,
                                        type: event.target.value as CardType,
                                        copies: 1,
                                        url: cardProps.type === CardType.Bookmark ? 'https://uselessshit.co/#were-handed-a-card' : 'https://uselessshit.co'
                                    })
                                }}
                                name="cardType"
                                id="cardType"
                            >
                                <FormControlLabel value="business-card" control={<Radio />} label="Business Card" />
                                <FormControlLabel value="bookmark" control={<Radio />} label="Bookmark" />
                                <FormControlLabel value="sticker" control={<Radio />} label="Sticker" />
                            </RadioGroup>
                        </FormControl>
                    </Item>
                    <Item>
                        <FormLabel sx={{ paddingRight: '0.5em' }} id="copies-label">
                            No. of copies
                            <Tooltip title="Up to 9 business card copies per page & up to 5 bookmarks.">
                                <IconButton>
                                    <Info />
                                </IconButton>
                            </Tooltip>
                        </FormLabel>
                    </Item>
                    <Item>
                        <Input
                            id="copies"
                            name="copies"
                            type="number"
                            inputProps={{
                                step: "1",
                                label: "Number of copies"
                            }}
                            placeholder="Number of copies"
                            value={cardProps.copies}
                            onChange={(event) => {
                                formik.handleChange(event);
                                handleSetCopies(event.target.value as unknown as number);
                            }}
                        />
                    </Item>
                    <Item>
                        <FormLabel id="cardPrimaryText">
                            Primary text
                            <Tooltip title="Enter the primary text. Up to 74 characters.">
                                <IconButton>
                                    <Info />
                                </IconButton>
                            </Tooltip>
                        </FormLabel>
                    </Item>
                    <Item>
                        <TextField
                            id="slogan"
                            name="slogan"
                            type="text"
                            label="Enter text"
                            sx={{ width: '80%' }}
                            value={cardProps.slogan}
                            inputProps={{ maxLength: 74 }}
                            onChange={(event) => {
                                formik.handleChange(event);
                                setCardProps({
                                    ...cardProps,
                                    slogan: event.target.value
                                });
                            }} />
                    </Item>
                    <Item>
                        <FormLabel id="cardPrimaryTextSize">Primary text font size</FormLabel>
                    </Item>
                    <Item>
                        <Slider
                            aria-label="Primary Text Font Size"
                            value={cardProps.sloganFontSize}
                            valueLabelDisplay="auto"
                            onChange={(event, newSloganFontSize) => {
                            setCardProps({
                                ...cardProps,
                                sloganFontSize: newSloganFontSize as number
                            });
                        }} />
                    </Item>
                    <Item>
                        <FormLabel id="cardPrimaryTextColor">
                            Primary text color
                            <Tooltip title="Choose a color for the primary text.">
                                <IconButton>
                                    <Info />
                                </IconButton>
                            </Tooltip>
                        </FormLabel>
                    </Item>
                    <Item>
                        <SketchPicker className="color-picker" color={cardProps.sloganColor} onChangeComplete={(color: any) => {
                            setCardProps({
                                ...cardProps,
                                sloganColor: color.hex
                            })
                        }} />
                    </Item>
                    <Item>
                        <FormLabel id="cardSecondaryTextColor">
                            Secondary text color
                            <Tooltip title="Choose a color for the secondary text.">
                                <IconButton>
                                    <Info />
                                </IconButton>
                            </Tooltip>
                        </FormLabel>
                    </Item>
                    <Item>
                        <SketchPicker className="color-picker" color={cardProps.urlColor} onChangeComplete={(color: any) => {
                            setCardProps({
                                ...cardProps,
                                urlColor: color.hex
                            })
                        }} />
                    </Item>
                    <Item>
                        <FormLabel sx={{ paddingRight: '0.5em' }} id="imageLabel">
                            Image
                            <Tooltip title="Upload an image. Images with equal width & height please.">
                                <IconButton>
                                    <Info />
                                </IconButton>
                            </Tooltip>
                        </FormLabel>
                    </Item>
                    <Item>
                        <Input id="mainImage" name="mainImage" type="file" onChange={(event) => {
                            const files = (event.currentTarget as HTMLInputElement).files;
                            if (FileReader && files && files.length > 0) {
                                const fileReader = new FileReader();
                                fileReader.onloadend = () => {
                                    setCardProps({
                                        ...cardProps,
                                        mainImage: fileReader.result
                                    })
                                };
                                fileReader.readAsDataURL(files[0])
                            }
                        }} />
                    </Item>
                    <Item>
                        <FormLabel sx={{ paddingRight: '0.5em' }} id="backgroundImageLabel">
                            Background image
                            <Tooltip title="Upload a background image. 3.5 by 2in for business cards & 2 by 4in for bookmarks.">
                                <IconButton>
                                    <Info />
                                </IconButton>
                            </Tooltip>
                        </FormLabel>
                    </Item>
                    <Item>
                        <Input id="cardBackgroundImage" name="cardBackgroundImage" type="file" onChange={(event) => {
                            const files = (event.currentTarget as HTMLInputElement).files;
                            if (FileReader && files && files.length > 0) {
                                const fileReader = new FileReader();
                                fileReader.onloadend = () => {
                                    setCardProps({
                                        ...cardProps,
                                        backgroundImage: fileReader.result
                                    })
                                };
                                fileReader.readAsDataURL(files[0])
                            }
                        }} />
                    </Item>
                    <Item>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    className="checkbox"
                                    checked={includeLightningGift}
                                    onChange={toggleIncludeLightningGift}
                                />
                            }
                            label="Include Lightning Gift"
                            disabled={!!(cardProps.type === CardType.Sticker &&
                                (cardProps.receiveAddress || cardProps.receiveAddress !== ''))}
                        />
                        <Tooltip title="Add some sats to your creation and make it a gift card. Minimum 100 sats.">
                            <IconButton>
                                <Info />
                            </IconButton>
                        </Tooltip>
                    </Item>
                    {
                        includeLightningGift &&
                        <React.Fragment>
                            <Item>
                                <Input
                                    id="satsAmount"
                                    name="satsAmount"
                                    type="number"
                                    inputProps={{
                                        step: "1",
                                        min: 100
                                    }}
                                    startAdornment={
                                        <InputAdornment className="icon" position="start">₿</InputAdornment>
                                    }
                                    placeholder={'Enter amount in sats'}
                                    value={formik.values.satsAmount}
                                    onChange={formik.handleChange}
                                />
                            </Item>
                            <Item>
                                <LightningGift
                                    handleRedeemLnurl={(urls) => {
                                        setLnurls(urls);
                                    }}
                                    handleIsLoading={handleIsLoading}
                                    satsAmount={formik.values.satsAmount as unknown as number}
                                    numberOfGifts={cardProps.copies}
                                />
                            </Item>
                        </React.Fragment>
                    }
                    <Item>
                        {
                                <React.Fragment>
                                    <Item>
                                        <FormLabel id="cardPrimaryTextColor">
                                            Receive address
                                            <Tooltip title="Your wallet address to receive payments.">
                                                <IconButton>
                                                    <Info />
                                                </IconButton>
                                            </Tooltip>
                                        </FormLabel>
                                    </Item>
                                    <Item>
                                        <TextField
                                            id="receiveAddress"
                                            name="receiveAddress"
                                            type="text"
                                            label="Enter address"
                                            sx={{ width: '80%' }}
                                            value={cardProps.receiveAddress}
                                            disabled={cardProps.type !== CardType.Sticker || includeLightningGift}
                                            onChange={(event) => {
                                                formik.handleChange(event);
                                                setCardProps({
                                                    ...cardProps,
                                                    receiveAddress: event.target.value
                                                });
                                            }} />
                                    </Item>
                                </React.Fragment>
                        }
                    </Item>
                    <Item>
                        <Button
                            sx={{ fontWeight: 'bold' }}
                            variant="contained"
                            onClick={() => {
                                downloadCard()
                                    .then()
                                    .catch(error => console.error({error}))
                                ;
                            }}
                            disabled={includeLightningGift && lnurls.length === 0}
                        >
                            Download Card!
                        </Button>
                    </Item>
                </Stack>
            </form>
            <LoadingAnimation isLoading={isLoading} />
        </Box>
    );
};
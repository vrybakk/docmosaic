import { ArrowBigRight, FileKey2, HandCoins, HardDrive, Lock, Shield } from 'lucide-react';
import Image from 'next/image';
import Typography from '../common/typography';
import { CustomLink } from '../ui/core/link';

const Hero = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <div className="space-y-4">
                    <Typography variant="h2" tag="h1">
                        <span className="text-docmosaic-caramel">PDF</span> Editing
                        <br />
                        Shouldn&apos;t Be This
                        <br />
                        <span className="text-docmosaic-cream">Hard</span> – So{' '}
                        <span className="text-docmosaic-sage">We Fixed It</span>
                    </Typography>
                    <Typography variant="paragraph" className="max-w-xl mt-2">
                        Whether you&apos;re preparing visa documents, printing IDs, or creating
                        professional layouts - existing tools made it complicated. So I built this -{' '}
                        <span className="font-medium">fast, simple, DONE in seconds!</span>
                    </Typography>
                    <div className="flex flex-wrap gap-4">
                        {keyFeatures.map((feature, index) => (
                            <div
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full bg-docmosaic-sage uppercase"
                            >
                                <feature.icon className="w-4 h-4 mr-2" />
                                <Typography variant="small">{feature.text}</Typography>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <CustomLink
                            href="/pdf-editor"
                            variant={'gradient'}
                            icon={
                                <ArrowBigRight
                                    className="group-hover:translate-x-1 transition-transform"
                                    size={18}
                                />
                            }
                        >
                            Try It Instantly
                        </CustomLink>
                    </div>
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <Typography variant="small">
                            <b className="font-semibold">Privacy-First:</b> Your files never leave
                            your device.
                        </Typography>
                    </div>
                </div>
            </div>

            <div className="p-4 pb-5 rounded-[20px] bg-white overflow-hidden shadow-[0px_0px_8px_0px_#00000026]">
                <Image
                    src="/showcases/hero.png"
                    alt="DocMosaic Demo"
                    width={800}
                    height={600}
                    className="object-cover"
                />

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Image
                            src="/logo.svg"
                            alt="DocMosaic"
                            width={20}
                            height={20}
                            className="object-cover"
                        />
                        <Typography variant="h5">DocMosaic</Typography>
                    </div>
                    <Typography variant="h6">Drag. Arrange. Export. Done.</Typography>
                </div>
            </div>
        </div>
    );
};

export default Hero;

const keyFeatures = [
    { icon: FileKey2, text: 'No Sign-Up' },
    { icon: Shield, text: 'Privacy-First' },
    { icon: HandCoins, text: 'Always Free' },
    { icon: HardDrive, text: 'No Server' },
];

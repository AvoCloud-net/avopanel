import { useState } from 'react';
import AdminBox from '@/elements/AdminBox';
import { Button } from '@/elements/button';
import { useStoreActions, useStoreState } from '@/state/hooks';
import { faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
import Label from '@/elements/Label';
import Input from '@/elements/Input';
import { updateSettings } from '@/api/routes/admin/billing';
import FlashMessageRender from '@/elements/FlashMessageRender';
import useFlash from '@/plugins/useFlash';

export default () => {
    const settings = useStoreState(s => s.everest.data!.billing);
    const updateEverest = useStoreActions(s => s.everest.updateEverest);
    const { clearFlashes, addFlash } = useFlash();

    const [paidRenewalDays, setPaidRenewalDays] = useState<number>(settings.renewal?.days || 30);
    const [freeRenewalDays, setFreeRenewalDays] = useState<number>(settings.renewal?.days || 30);
    const [freeRenewalThreshold, setFreeRenewalThreshold] = useState<number>(
        settings.renewal?.suspension_threshold || 7
    );
    const [freeGraceDays, setFreeGraceDays] = useState<number>(
        settings.renewal?.free_suspension_days || 7
    );
    const [paidGraceDays, setPaidGraceDays] = useState<number>(
        settings.renewal?.paid_suspension_days || 30
    );
    const [loading, setLoading] = useState(false);

    const handleSavePaidRenewalDays = async () => {
        clearFlashes('admin:billing');
        setLoading(true);

        try {
            await updateSettings('renewal:days', paidRenewalDays);
            updateEverest({
                billing: {
                    ...settings,
                    renewal: {
                        ...settings.renewal,
                        days: paidRenewalDays,
                    },
                },
            });
            addFlash({
                key: 'admin:billing',
                type: 'success',
                message: 'Paid renewal period updated successfully.',
            });
        } catch (error) {
            console.error(error);
            addFlash({
                key: 'admin:billing',
                type: 'error',
                message: 'Failed to update paid renewal period.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFreeRenewalDays = async () => {
        clearFlashes('admin:billing');
        setLoading(true);

        try {
            await updateSettings('renewal:days', freeRenewalDays);
            updateEverest({
                billing: {
                    ...settings,
                    renewal: {
                        ...settings.renewal,
                        days: freeRenewalDays,
                    },
                },
            });
            addFlash({
                key: 'admin:billing',
                type: 'success',
                message: 'Free renewal period updated successfully.',
            });
        } catch (error) {
            console.error(error);
            addFlash({
                key: 'admin:billing',
                type: 'error',
                message: 'Failed to update free renewal period.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFreeRenewalThreshold = async () => {
        clearFlashes('admin:billing');
        setLoading(true);

        try {
            await updateSettings('renewal:suspension_threshold', freeRenewalThreshold);
            updateEverest({
                billing: {
                    ...settings,
                    renewal: {
                        ...settings.renewal,
                        suspension_threshold: freeRenewalThreshold,
                    },
                },
            });
            addFlash({
                key: 'admin:billing',
                type: 'success',
                message: 'Free renewal threshold updated successfully.',
            });
        } catch (error) {
            console.error(error);
            addFlash({
                key: 'admin:billing',
                type: 'error',
                message: 'Failed to update free renewal threshold.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFreeGraceDays = async () => {
        clearFlashes('admin:billing');
        setLoading(true);

        try {
            await updateSettings('renewal:free_suspension_days', freeGraceDays);
            updateEverest({
                billing: {
                    ...settings,
                    renewal: {
                        ...settings.renewal,
                        free_suspension_days: freeGraceDays,
                    },
                },
            });
            addFlash({
                key: 'admin:billing',
                type: 'success',
                message: 'Free grace period updated successfully.',
            });
        } catch (error) {
            console.error(error);
            addFlash({
                key: 'admin:billing',
                type: 'error',
                message: 'Failed to update free grace period.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSavePaidGraceDays = async () => {
        clearFlashes('admin:billing');
        setLoading(true);

        try {
            await updateSettings('renewal:paid_suspension_days', paidGraceDays);
            updateEverest({
                billing: {
                    ...settings,
                    renewal: {
                        ...settings.renewal,
                        paid_suspension_days: paidGraceDays,
                    },
                },
            });
            addFlash({
                key: 'admin:billing',
                type: 'success',
                message: 'Paid grace period updated successfully.',
            });
        } catch (error) {
            console.error(error);
            addFlash({
                key: 'admin:billing',
                type: 'error',
                message: 'Failed to update paid grace period.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={'grid lg:grid-cols-2 gap-4'}>
            <FlashMessageRender byKey={'admin:billing'} className={'mb-4 col-span-2'} />

            <AdminBox title={'Paid Renewal Period (Days)'} icon={faCalendar}>
                <p className={'text-gray-400 mb-4'}>
                    Number of days a paid server subscription lasts when purchased or renewed.
                </p>
                <div className={'mb-4'}>
                    <Label>Days</Label>
                    <Input
                        type={'number'}
                        min={1}
                        max={365}
                        value={paidRenewalDays}
                        onChange={e => setPaidRenewalDays(parseInt(e.target.value) || 30)}
                        disabled={loading}
                    />
                    <p className={'text-xs text-gray-500 mt-2'}>
                        When a paid server is purchased or renewed, it will be active for this many days.
                    </p>
                </div>
                <div className={'text-right'}>
                    <Button onClick={handleSavePaidRenewalDays} disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </AdminBox>

            <AdminBox title={'Paid Grace Period (Days)'} icon={faClock}>
                <p className={'text-gray-400 mb-4'}>
                    Number of days after expiration before a paid server is automatically suspended.
                </p>
                <div className={'mb-4'}>
                    <Label>Days</Label>
                    <Input
                        type={'number'}
                        min={0}
                        max={90}
                        value={paidGraceDays}
                        onChange={e => setPaidGraceDays(parseInt(e.target.value) || 30)}
                        disabled={loading}
                    />
                    <p className={'text-xs text-gray-500 mt-2'}>
                        Paid servers will be suspended this many days after their renewal date passes.
                    </p>
                </div>
                <div className={'text-right'}>
                    <Button onClick={handleSavePaidGraceDays} disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </AdminBox>

            <AdminBox title={'Free Renewal Period (Days)'} icon={faCalendar}>
                <p className={'text-gray-400 mb-4'}>
                    Number of days a free server subscription lasts when created or renewed.
                </p>
                <div className={'mb-4'}>
                    <Label>Days</Label>
                    <Input
                        type={'number'}
                        min={1}
                        max={365}
                        value={freeRenewalDays}
                        onChange={e => setFreeRenewalDays(parseInt(e.target.value) || 30)}
                        disabled={loading}
                    />
                    <p className={'text-xs text-gray-500 mt-2'}>
                        When a free server is created or renewed, it will be active for this many days.
                    </p>
                </div>
                <div className={'text-right'}>
                    <Button onClick={handleSaveFreeRenewalDays} disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </AdminBox>

            <AdminBox title={'Free Grace Period (Days)'} icon={faClock}>
                <p className={'text-gray-400 mb-4'}>
                    Number of days after expiration before a free server is automatically suspended.
                </p>
                <div className={'mb-4'}>
                    <Label>Days</Label>
                    <Input
                        type={'number'}
                        min={0}
                        max={90}
                        value={freeGraceDays}
                        onChange={e => setFreeGraceDays(parseInt(e.target.value) || 7)}
                        disabled={loading}
                    />
                    <p className={'text-xs text-gray-500 mt-2'}>
                        Free servers will be suspended this many days after their renewal date passes.
                    </p>
                </div>
                <div className={'text-right'}>
                    <Button onClick={handleSaveFreeGraceDays} disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </AdminBox>

            <div className={'col-span-2'}>
                <AdminBox title={'Free Server Renewal Window'} icon={faClock}>
                    <p className={'text-gray-400 mb-4'}>
                        Number of days before expiration when users can renew their free servers. Paid servers can be renewed at any time.
                    </p>
                    <div className={'mb-4'}>
                        <Label>Days Before Expiration</Label>
                        <Input
                            type={'number'}
                            min={0}
                            max={30}
                            value={freeRenewalThreshold}
                            onChange={e => setFreeRenewalThreshold(parseInt(e.target.value) || 7)}
                            disabled={loading}
                        />
                        <p className={'text-xs text-gray-500 mt-2'}>
                            Free servers can be renewed when there are this many days or fewer remaining until expiration.
                        </p>
                    </div>
                    <div className={'text-right'}>
                        <Button onClick={handleSaveFreeRenewalThreshold} disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </AdminBox>
            </div>
        </div>
    );
};

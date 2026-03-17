import { Button } from '@/elements/button';
import { Dialog } from '@/elements/dialog';
import { useState } from 'react';

export default () => {
    const [open, setOpen] = useState<boolean>(false);

    const submit = () => {
        //
    };

    return (
        <>
            <Dialog.Confirm
                open={open}
                onClose={() => setOpen(false)}
                title={'Confirm discount code deletion'}
                onConfirmed={submit}
            >
                Are you sure you wish to delete this discount code? It will not be able to be used for new orders.
                Users` who already recieve an active discount from this code will continue to gain the discount on
                their` account until it runs out.
            </Dialog.Confirm>
            <Button.Danger type={'button'} size={Button.Sizes.Small} onClick={() => setOpen(true)}>
                Delete
            </Button.Danger>
        </>
    );
};

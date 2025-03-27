use anchor_lang::prelude::*;
use anchor_lang::solana_program::native_token::LAMPORTS_PER_SOL;
use anchor_lang::system_program;

declare_id!("7znntp5GpKkQBJSXKR7jkE78b2wTXGHSvhnanCxeEREo");

#[program]
pub mod bet_house {
    use super::*;
    const LAMPORT_AMOUNT: u64 = LAMPORTS_PER_SOL / 10;

    // Initializes the contract pool
    pub fn initialize_contract_pool(_ctx: Context<InitializeContractPool>) -> Result<()> {
        Ok(())
    }

    /// Users place a bet by transferring tokens to the contract pool.
    pub fn place_bet(ctx: Context<PlaceBet>) -> Result<()> {
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.player.to_account_info().clone(),
                to: ctx.accounts.pool_account.to_account_info().clone(),
            },
        );
        system_program::transfer(cpi_context, LAMPORT_AMOUNT)?;
        msg!("You made a bet of {} SOL", LAMPORT_AMOUNT);
        Ok(())
    }

    /// Resolves a bet, transferring a reward to the user if they win.
    pub fn resolve_bet(ctx: Context<ResolveBet>, win: bool) -> Result<()> {
        if win {
            **ctx
                .accounts
                .pool_account
                .to_account_info()
                .try_borrow_mut_lamports()? -= LAMPORT_AMOUNT;
            **ctx
                .accounts
                .player
                .to_account_info()
                .try_borrow_mut_lamports()? += LAMPORT_AMOUNT;
            msg!("User {} won {}.", ctx.accounts.player.key(), LAMPORT_AMOUNT);
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeContractPool<'info> {
    #[account(
    init_if_needed,
    seeds = [b"pool"],
    bump,
    payer= signer,
    space = 8
   )]
    pub pool_account: Account<'info, PoolAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
#[account]
pub struct PoolAccount {}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(
        mut,
        seeds = [b"pool"],
        bump
    )]
    pub pool_account: Account<'info, PoolAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveBet<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool"],
        bump
    )]
    pub pool_account: Account<'info, PoolAccount>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized action.")]
    Unauthorized,
}
